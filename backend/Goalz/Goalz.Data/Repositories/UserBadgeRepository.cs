using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class UserBadgeRepository : IUserBadgeRepository
    {
        private readonly AppDbContext _context;

        public UserBadgeRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<List<UserBadge>> GetByUserIdAsync(long userId)
            => _context.UserBadges.Where(b => b.UserId == userId).ToListAsync();

        public async Task AddAsync(UserBadge badge)
            => await _context.UserBadges.AddAsync(badge);

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
