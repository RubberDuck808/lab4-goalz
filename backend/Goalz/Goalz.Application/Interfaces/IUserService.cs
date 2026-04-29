using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IUserService
    {
        Task<GameLoginResponse?> LoginAsync(GameLoginRequest request);
        Task<(GameSignUpResponse? User, string? Error)> SignUpAsync(GameSignUpRequest request);
        Task<(UpdateProfileResponse? Profile, string? Error)> UpdateProfileAsync(string currentUsername, UpdateProfileRequest request);
        Task<string?> ChangePasswordAsync(string username, ChangePasswordRequest request);
        Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync();
    }
}
