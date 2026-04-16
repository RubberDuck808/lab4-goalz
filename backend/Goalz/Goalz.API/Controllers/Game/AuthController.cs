using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/auth")]
    [EnableRateLimiting("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] GameLoginRequest request)
        {
            var result = await _userService.LoginAsync(request);

            if (result == null)
                return Unauthorized("Invalid email or password.");

            return Ok(result);
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] GameSignUpRequest request)
        {
            var (user, error) = await _userService.SignUpAsync(request);

            if (error == "email_taken")
                return Conflict("An account with this email already exists.");

            if (error == "username_taken")
                return Conflict("This username is already taken.");

            return CreatedAtAction(nameof(SignUp), user);
        }
    }
}
