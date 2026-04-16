using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IAuthService
    {
        Task<LoginRequest?> CheckAuth(string email, string password);
    }
}
