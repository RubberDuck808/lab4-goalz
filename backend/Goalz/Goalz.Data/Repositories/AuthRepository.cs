using Goalz.Domain.Entities;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context) 
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
