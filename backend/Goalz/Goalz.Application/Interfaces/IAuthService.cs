using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IAuthService
    {
        Task<DashboardLoginResponse?> CheckAuth(string email, string password);
        Task<(DashboardLoginResponse? Result, string? Error)> CreateStaffUserAsync(CreateStaffUserRequest request);
        Task<(IEnumerable<StaffUserDto>? Users, string? Error)> GetStaffUsersAsync(string adminEmail);
        Task<(bool Success, string? Error)> ChangeUserRoleAsync(string adminEmail, long userId, string newRole);
        Task<(bool Success, string? Error)> DeleteUserAsync(string adminEmail, long userId);
    }
}
