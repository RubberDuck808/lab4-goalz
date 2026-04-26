using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;

        public AuthService(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<DashboardLoginResponse?> CheckAuth(string email, string password)
        {
            var user = await _authRepository.GetUserByEmail(email);

            if (user != null)
            {
                bool isverify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

                if (isverify)
                {
                    return new DashboardLoginResponse { Email = user.Email, Name = user.Name, Role = user.Role.ToString() };
                }
            }

            return null;
        }

        public async Task<(DashboardLoginResponse? Result, string? Error)> CreateStaffUserAsync(CreateStaffUserRequest request)
        {
            var admin = await _authRepository.GetUserByEmail(request.AdminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (null, "unauthorized");

            var existing = await _authRepository.GetUserByEmail(request.Email);
            if (existing != null)
                return (null, "email_taken");

            var user = new User
            {
                Username = request.Email,
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Role.Staff
            };

            await _authRepository.CreateUserAsync(user);

            return (new DashboardLoginResponse { Email = user.Email, Name = user.Name, Role = user.Role.ToString() }, null);
        }
    }
}