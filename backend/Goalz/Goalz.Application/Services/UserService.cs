using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<GameLoginResponse?> LoginAsync(GameLoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null) return null;

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            return new GameLoginResponse
            {
                Username = user.Username,
                Name = user.Name,
                Email = user.Email
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
                Username = user.Username,
                Name = user.Name,
                Email = user.Email
            }, null);
        }
    }
}
