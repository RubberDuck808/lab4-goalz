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

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string adminEmail)
        {
            var (users, error) = await _authService.GetStaffUsersAsync(adminEmail);
            if (error != null)
                return Unauthorized("Only admins can view users.");
            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeRole(long id, [FromBody] ChangeRoleRequest request)
        {
            var (success, error) = await _authService.ChangeUserRoleAsync(request.AdminEmail, id, request.NewRole);
            if (!success)
            {
                return error switch
                {
                    "unauthorized" => Unauthorized("Only admins can change user roles."),
                    "not_found" => NotFound("User not found."),
                    "invalid_role" => BadRequest("Role must be 'Staff' or 'Admin'."),
                    _ => BadRequest("Something went wrong.")
                };
            }
            return NoContent();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(long id, [FromQuery] string adminEmail)
        {
            var (success, error) = await _authService.DeleteUserAsync(adminEmail, id);
            if (!success)
            {
                return error switch
                {
                    "unauthorized" => Unauthorized("Only admins can delete users."),
                    "not_found" => NotFound("User not found."),
                    "cannot_self_delete" => BadRequest("You cannot delete your own account."),
                    _ => BadRequest("Something went wrong.")
                };
            }
            return NoContent();
        }
    }
}