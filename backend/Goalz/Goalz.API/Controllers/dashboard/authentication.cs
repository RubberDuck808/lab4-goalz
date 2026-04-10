using Microsoft.AspNetCore.Mvc;
using Goalz.Core;
using Goalz.Core.DTOs; // <--- Add this line to fix CS0246
using System.Threading.Tasks;

namespace Goalz.Api.Controllers
{
    [ApiController]
    [Route("api/dashboard/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        // The system will automatically provide the AuthService here
        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            // Now this will actually talk to Postgres!
            LoginRequest success = await _authService.checkAuth(model.Email, model.Password);
            return success != null ? Ok(success) : Unauthorized();
        }
    }
}