using System;
using Goalz.Core.Entities;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;

namespace Goalz.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context) 
        {
            _context = context;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return _context.Users.FirstOrDefault(u => u.Email == email);
        }
    }
}
