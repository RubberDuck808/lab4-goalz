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
            => await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

        public async Task<User?> GetByEmailAsync(string email)
            => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> GetByUsernameAsync(string username)
            => await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

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
            => await _context.Users.AnyAsync(u => u.Email == email);

        public async Task<bool> ExistsByUsernameAsync(string username)
            => await _context.Users.AnyAsync(u => u.Username == username);

        public async Task AddAsync(User user)
            => await _context.Users.AddAsync(user);

        public Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();

        // ── UserStatistics ────────────────────────────────────────────────────

        /// <summary>
        /// Returns the stats row for the user, creating it if it doesn't exist yet.
        /// Caller is responsible for calling SaveChangesAsync.
        /// </summary>
        private async Task<UserStatistics> GetOrCreateStatsAsync(long userId)
        {
            var stats = await _context.UserStatistics.FirstOrDefaultAsync(s => s.UserId == userId);
            if (stats != null) return stats;
            stats = new UserStatistics { UserId = userId };
            _context.UserStatistics.Add(stats);
            return stats;
        }

        public async Task AddGameStatsAsync(string username, int checkpointsVisited, int quizScore)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return;
            var stats = await GetOrCreateStatsAsync(user.Id);
            var points = (long)(checkpointsVisited * 10) + quizScore;
            stats.CheckpointsVisited += checkpointsVisited;
            stats.GamesPlayed        += 1;
            stats.TotalPoints        += points;
            _context.UserPointsLogs.Add(new UserPointsLog { UserId = user.Id, PointsEarned = points });
            await _context.SaveChangesAsync();
        }

        public async Task IncrementPartiesJoinedAsync(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return;
            var stats = await GetOrCreateStatsAsync(user.Id);
            stats.PartiesJoined += 1;
            await _context.SaveChangesAsync();
        }

        public async Task IncrementPicturesTakenAsync(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return;
            var stats = await GetOrCreateStatsAsync(user.Id);
            stats.PicturesTaken += 1;
            await _context.SaveChangesAsync();
        }

        public async Task<UserStatisticsDto> GetStatsAsync(string username)
        {
            var stats = await _context.UserStatistics
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.User.Username == username);

            return stats == null
                ? new UserStatisticsDto()
                : new UserStatisticsDto
                {
                    CheckpointsVisited = stats.CheckpointsVisited,
                    PicturesTaken      = stats.PicturesTaken,
                    PartiesJoined      = stats.PartiesJoined,
                    GamesPlayed        = stats.GamesPlayed,
                    TotalPoints        = stats.TotalPoints,
                };
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(string? period = null, int limit = 50)
        {
            if (period == "week" || period == "month")
            {
                var since = period == "week"
                    ? DateTime.UtcNow.AddDays(-7)
                    : DateTime.UtcNow.AddDays(-30);

                var periodRows = await _context.Users
                    .Where(u => u.Role == Role.Player)
                    .Select(u => new
                    {
                        u.Username,
                        u.AvatarId,
                        TotalPoints = _context.UserPointsLogs
                            .Where(l => l.UserId == u.Id && l.EarnedAt >= since)
                            .Sum(l => (long?)l.PointsEarned) ?? 0L,
                    })
                    .OrderByDescending(x => x.TotalPoints)
                    .Take(limit)
                    .ToListAsync();

                return periodRows.Select((x, i) => new LeaderboardEntryDto
                {
                    Rank        = i + 1,
                    Username    = x.Username,
                    AvatarId    = x.AvatarId,
                    TotalPoints = x.TotalPoints,
                });
            }

            // All time — sum from UserStatistics
            var rows = await _context.Users
                .Where(u => u.Role == Role.Player)
                .Select(u => new
                {
                    u.Username,
                    u.AvatarId,
                    TotalPoints = (long?)(u.Statistics == null ? 0 : u.Statistics.TotalPoints) ?? 0L,
                })
                .OrderByDescending(x => x.TotalPoints)
                .Take(limit)
                .ToListAsync();

            return rows.Select((x, i) => new LeaderboardEntryDto
            {
                Rank        = i + 1,
                Username    = x.Username,
                AvatarId    = x.AvatarId,
                TotalPoints = x.TotalPoints,
            });
        }
    }
}
