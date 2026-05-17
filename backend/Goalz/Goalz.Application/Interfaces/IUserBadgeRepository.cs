using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IUserBadgeRepository
    {
        Task<List<UserBadge>> GetByUserIdAsync(long userId);
        Task AddAsync(UserBadge badge);
        Task SaveChangesAsync();
    }
}
