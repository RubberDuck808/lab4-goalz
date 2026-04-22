namespace Goalz.Core.DTOs
{
    public class CreateStaffUserRequest
    {
        public string AdminEmail { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
