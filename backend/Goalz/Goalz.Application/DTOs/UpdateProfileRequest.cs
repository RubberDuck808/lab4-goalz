using System.ComponentModel.DataAnnotations;

namespace Goalz.Core.DTOs
{
    public class UpdateProfileRequest
    {
        [StringLength(255, MinimumLength = 3)]
        public string? Username { get; set; }

        [EmailAddress]
        [StringLength(255)]
        public string? Email { get; set; }

        public int? AvatarId { get; set; }
    }
}
