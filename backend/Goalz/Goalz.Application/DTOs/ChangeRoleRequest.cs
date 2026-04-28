namespace Goalz.Core.DTOs
{
    public class ChangeRoleRequest
    {
        public string AdminEmail { get; set; } = string.Empty;
        public string NewRole { get; set; } = string.Empty;
    }
}
