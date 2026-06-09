using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IBadgeService
    {
        Task CheckAndAwardAsync(long userId, UserStatistics stats);
    }
}
