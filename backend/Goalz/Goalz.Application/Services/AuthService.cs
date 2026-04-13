using Goalz.Infrastructure.Data;
using Goalz.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Application.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LoginRequest> checkAuth(string email, string password)
        {
            // Look for the user in the real database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                LoginRequest result = new LoginRequest();
                result.Email = user.Email;
                result.Name = user.Name;
                // Verify provided password against the hash stored in DB
                bool isverify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
                if (isverify) { return result; 
                }
            }
            return null;
        }
    }
}