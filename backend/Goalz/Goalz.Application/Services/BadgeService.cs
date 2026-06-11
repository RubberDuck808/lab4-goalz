using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class BadgeService : IBadgeService
    {
        private readonly IUserBadgeRepository _repo;

        private static readonly (string Id, Func<UserStatistics, bool> Check)[] Checks =
        [
            ("first_steps",  s => s.GamesPlayed >= 1),
            ("trail_blazer", s => s.CheckpointsVisited >= 5),
            ("nut_hoarder",  s => s.TotalPoints >= 100),
            ("party_animal", s => s.PartiesJoined >= 1),
        ];

        public BadgeService(IUserBadgeRepository repo)
        {
            _repo = repo;
        }

        public async Task CheckAndAwardAsync(long userId, UserStatistics stats)
        {
            var existing = await _repo.GetByUserIdAsync(userId);
            var earnedIds = existing.Select(b => b.BadgeId).ToHashSet();

            var newBadges = Checks
                .Where(c => !earnedIds.Contains(c.Id) && c.Check(stats))
                .Select(c => new UserBadge { UserId = userId, BadgeId = c.Id })
                .ToList();

            if (newBadges.Count == 0) return;

            foreach (var badge in newBadges)
                await _repo.AddAsync(badge);

            await _repo.SaveChangesAsync();
        }
    }
}
