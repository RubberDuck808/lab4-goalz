using System.ComponentModel.DataAnnotations;

namespace Goalz.Core.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}