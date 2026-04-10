using Goalz.Api.Storage;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Core
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> checkAuth(string email, string password)
        {
            // Look for the user in the real database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                // Verify provided password against the hash stored in DB
                return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            }
            return false;
        }
    }
}