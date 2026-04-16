using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class FriendshipRepository : IFriendshipRepository
    {
        private readonly AppDbContext _context;

        public FriendshipRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Friendship friendship)
        {
            await _context.Friendships.AddAsync(friendship);
        }

        public async Task<Friendship?> GetByUsersAsync(long requesterId, long addresseeId)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f => f.RequesterId == requesterId && f.AddresseeId == addresseeId);
        }

        public async Task<Friendship?> GetBetweenUsersAsync(long userAId, long userBId)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.RequesterId == userAId && f.AddresseeId == userBId) ||
                    (f.RequesterId == userBId && f.AddresseeId == userAId));
        }

        public async Task<IEnumerable<Friendship>> GetAcceptedAsync(long userId)
        {
            return await _context.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Where(f => f.Status == FriendshipStatus.Accepted &&
                            (f.RequesterId == userId || f.AddresseeId == userId))
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetPendingReceivedAsync(long userId)
        {
            return await _context.Friendships
                .Include(f => f.Requester)
                .Where(f => f.Status == FriendshipStatus.Pending && f.AddresseeId == userId)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(long requesterId, long addresseeId)
        {
            return await _context.Friendships
                .AnyAsync(f => f.RequesterId == requesterId && f.AddresseeId == addresseeId);
        }

        public void DeleteAsync(Friendship friendship)
        {
            _context.Friendships.Remove(friendship);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
