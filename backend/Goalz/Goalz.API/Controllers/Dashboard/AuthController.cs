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
            LoginRequest success = await _authService.CheckAuth(model.Email, model.Password);

            if (success == null)
            {
                return NotFound("User is not found!");
            }

            return Ok(success);
        }
    }
}