namespace Goalz.Core.DTOs
{
    public class UpdateProfileResponse
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int AvatarId { get; set; } = 1;
        public string Token { get; set; } = string.Empty;
    }
}
