using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IUserService
    {
        Task<GameLoginResponse?> LoginAsync(GameLoginRequest request);
        Task<(GameSignUpResponse? User, string? Error)> SignUpAsync(GameSignUpRequest request);
    }
}
