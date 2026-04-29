using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public UserService(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<GameLoginResponse?> LoginAsync(GameLoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null) return null;

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            return new GameLoginResponse
            {
                Token = _jwtService.Generate(user.Username, user.Role.ToString()),
                Username = user.Username,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<(GameSignUpResponse? User, string? Error)> SignUpAsync(GameSignUpRequest request)
        {
            if (await _userRepository.ExistsByEmailAsync(request.Email))
                return (null, "email_taken");

            if (await _userRepository.ExistsByUsernameAsync(request.Username))
                return (null, "username_taken");

            var user = new User
            {
                Username = request.Username,
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Role.Player
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return (new GameSignUpResponse
            {
                Token = _jwtService.Generate(user.Username, user.Role.ToString()),
                Username = user.Username,
                Name = user.Name,
                Email = user.Email
            }, null);
        }

        public async Task<(UpdateProfileResponse? Profile, string? Error)> UpdateProfileAsync(string currentUsername, UpdateProfileRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(currentUsername);
            if (user == null) return (null, "not_found");

            if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.Username)
            {
                if (await _userRepository.ExistsByUsernameAsync(request.Username))
                    return (null, "username_taken");
                user.Username = request.Username;
            }

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
            {
                if (await _userRepository.ExistsByEmailAsync(request.Email))
                    return (null, "email_taken");
                user.Email = request.Email;
            }

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();

            return (new UpdateProfileResponse { Username = user.Username, Email = user.Email }, null);
        }

        public async Task<string?> ChangePasswordAsync(string username, ChangePasswordRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return "not_found";

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return "wrong_password";

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();

            return null;
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync()
        {
            return await _userRepository.GetLeaderboardAsync();
        }
    }
}
