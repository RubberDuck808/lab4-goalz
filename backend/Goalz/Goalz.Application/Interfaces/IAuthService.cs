using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IAuthService
    {
        Task<DashboardLoginResponse?> CheckAuth(string email, string password);
        Task<(DashboardLoginResponse? Result, string? Error)> CreateStaffUserAsync(CreateStaffUserRequest request);
    }
}
