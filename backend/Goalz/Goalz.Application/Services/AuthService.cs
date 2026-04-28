using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;

        public AuthService(IAuthRepository authRepository, IJwtService jwtService)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
        }

        public async Task<DashboardLoginResponse?> CheckAuth(string email, string password)
        {
            var user = await _authRepository.GetUserByEmail(email);

            if (user != null)
            {
                bool isverify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

                if (isverify)
                {
                    return new DashboardLoginResponse
                    {
                        Token = _jwtService.Generate(user.Email, user.Role.ToString(), user.Name),
                        Email = user.Email,
                        Name = user.Name,
                        Role = user.Role.ToString()
                    };
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

        public async Task<(IEnumerable<StaffUserDto>? Users, string? Error)> GetStaffUsersAsync(string adminEmail)
        {
            var admin = await _authRepository.GetUserByEmail(adminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (null, "unauthorized");

            var users = await _authRepository.GetAllStaffAndAdminAsync();
            return (users.Select(u => new StaffUserDto { Id = u.Id, Name = u.Name, Email = u.Email, Role = u.Role.ToString() }), null);
        }

        public async Task<(bool Success, string? Error)> ChangeUserRoleAsync(string adminEmail, long userId, string newRole)
        {
            var admin = await _authRepository.GetUserByEmail(adminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (false, "unauthorized");

            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null)
                return (false, "not_found");

            if (!Enum.TryParse<Role>(newRole, ignoreCase: true, out var role) || role == Role.Player)
                return (false, "invalid_role");

            user.Role = role;
            await _authRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteUserAsync(string adminEmail, long userId)
        {
            var admin = await _authRepository.GetUserByEmail(adminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (false, "unauthorized");

            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null)
                return (false, "not_found");

            if (user.Id == admin.Id)
                return (false, "cannot_self_delete");

            await _authRepository.DeleteUserAsync(user);
            await _authRepository.SaveChangesAsync();
            return (true, null);
        }
    }
}