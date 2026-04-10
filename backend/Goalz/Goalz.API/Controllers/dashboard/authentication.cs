using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Goalz.Core;

namespace Goalz.APi.Controllers 
{
    [ApiController]
    [Route("api/dashboard/Auth")] // This makes the URL: api/goals
    public class AuthController : ControllerBase
    {
        AuthService authService = new AuthService();
        [HttpGet]
        public IActionResult CheckAuth(string email, string password)
        {
            bool result = authService.checkAuth(email, password);
            return Ok(result);
        }
    }
}