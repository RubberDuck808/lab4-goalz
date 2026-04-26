using Microsoft.AspNetCore.Mvc;
using Goalz.Core.Interfaces;
using Goalz.Core.DTOs;

namespace Goalz.Api.Controllers
{
    [ApiController]
    [Route("api/dashboard/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        // The system will automatically provide the AuthService here
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var result = await _authService.CheckAuth(model.Email, model.Password);

            if (result == null)
                return NotFound("User not found or invalid password.");

            return Ok(result);
        }

        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] CreateStaffUserRequest request)
        {
            var (result, error) = await _authService.CreateStaffUserAsync(request);

            return error switch
            {
                "unauthorized" => Unauthorized("Only admins can create new users."),
                "email_taken" => Conflict("An account with this email already exists."),
                _ => CreatedAtAction(nameof(CreateUser), result)
            };
        }
    }
}