using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;

        public AuthService(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<LoginRequest> CheckAuth(string email, string password)
        {
            // Look for the user in the real database
            var user = await _authRepository.GetUserByEmail(email);

            if (user != null)
            {
                LoginRequest result = new LoginRequest();
                result.Email = user.Email;
                result.Name = user.Name;

                // Verify provided password against the hash stored in DB
                bool isverify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

                if (isverify) 
                { 
                    return result; 
                }
            }

            return null;
        }
    }
}