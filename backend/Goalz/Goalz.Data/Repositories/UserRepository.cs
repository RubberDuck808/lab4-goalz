using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(long id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<User>> SearchByUsernameAsync(string query, string excludeUsername, int limit = 10)
        {
            return await _context.Users
                .Where(u => u.Role == Role.Player
                         && u.Username != excludeUsername
                         && u.Username.ToLower().Contains(query.ToLower()))
                .Take(limit)
                .ToListAsync();
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(int limit = 50)
        {
            var scores = await _context.Users
                .Where(u => u.Role == Role.Player)
                .Select(u => new
                {
                    Username = u.Username,
                    TotalPoints = u.PartyMembers
                        .SelectMany(pm => pm.PartyGroup.PartyGroupAnswers)
                        .Sum(pga => (long?)pga.ReceivedPoints) ?? 0L,
                })
                .OrderByDescending(x => x.TotalPoints)
                .Take(limit)
                .ToListAsync();

            return scores.Select((x, i) => new LeaderboardEntryDto
            {
                Rank = i + 1,
                Username = x.Username,
                TotalPoints = x.TotalPoints,
            });
        }
    }
}
