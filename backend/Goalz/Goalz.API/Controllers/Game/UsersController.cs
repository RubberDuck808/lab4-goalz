using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var currentUsername = User.Identity?.Name;
            if (currentUsername == null) return Unauthorized();

            var (profile, error) = await _userService.UpdateProfileAsync(currentUsername, request);

            if (error == "username_taken") return Conflict("This username is already taken.");
            if (error == "email_taken") return Conflict("An account with this email already exists.");
            if (error == "not_found") return NotFound();

            return Ok(profile);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var username = User.Identity?.Name;
            if (username == null) return Unauthorized();

            var error = await _userService.ChangePasswordAsync(username, request);

            if (error == "wrong_password") return BadRequest("Current password is incorrect.");
            if (error == "not_found") return NotFound();

            return NoContent();
        }
    }
}
