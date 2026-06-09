using System.ComponentModel.DataAnnotations;

namespace Goalz.Core.DTOs
{
    public class CreateStaffUserRequest
    {
        public string AdminEmail { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        public string Password { get; set; } = string.Empty;
    }
}
