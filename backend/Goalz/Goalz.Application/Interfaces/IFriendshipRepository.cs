using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IFriendshipRepository
    {
        Task AddAsync(Friendship friendship);
        Task<Friendship?> GetByUsersAsync(long requesterId, long addresseeId);
        Task<Friendship?> GetBetweenUsersAsync(long userAId, long userBId);
        Task<IEnumerable<Friendship>> GetAcceptedAsync(long userId);
        Task<IEnumerable<Friendship>> GetPendingReceivedAsync(long userId);
        Task<bool> ExistsAsync(long requesterId, long addresseeId);
        void DeleteAsync(Friendship friendship);
        Task SaveChangesAsync();
    }
}
