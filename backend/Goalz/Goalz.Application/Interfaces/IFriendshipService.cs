using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IFriendshipService
    {
        Task<IEnumerable<FriendDto>> GetConnectionsAsync(string username);
        Task<IEnumerable<FriendDto>> GetRequestsAsync(string username);
        Task<(bool Success, string? Error)> SendRequestAsync(string requesterUsername, string addresseeUsername);
        Task<(bool Success, string? Error)> AcceptRequestAsync(string requesterUsername, string addresseeUsername);
        Task<(bool Success, string? Error)> DeclineRequestAsync(string requesterUsername, string addresseeUsername);
        Task<(bool Success, string? Error)> RemoveConnectionAsync(string usernameA, string usernameB);
    }
}
