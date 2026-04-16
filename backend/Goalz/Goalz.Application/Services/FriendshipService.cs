using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class FriendshipService : IFriendshipService
    {
        private readonly IFriendshipRepository _friendshipRepository;
        private readonly IUserRepository _userRepository;

        public FriendshipService(IFriendshipRepository friendshipRepository, IUserRepository userRepository)
        {
            _friendshipRepository = friendshipRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<FriendDto>> GetConnectionsAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return [];

            var friendships = await _friendshipRepository.GetAcceptedAsync(user.Id);

            return friendships.Select(f =>
            {
                var friend = f.RequesterId == user.Id ? f.Addressee : f.Requester;
                return new FriendDto { FriendshipId = f.Id, Username = friend.Username };
            });
        }

        public async Task<IEnumerable<FriendDto>> GetRequestsAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return [];

            var friendships = await _friendshipRepository.GetPendingReceivedAsync(user.Id);

            return friendships.Select(f => new FriendDto
            {
                FriendshipId = f.Id,
                Username = f.Requester.Username
            });
        }

        public async Task<(bool Success, string? Error)> SendRequestAsync(string requesterUsername, string addresseeUsername)
        {
            if (requesterUsername.Equals(addresseeUsername, StringComparison.OrdinalIgnoreCase))
                return (false, "cannot_self_add");

            var requester = await _userRepository.GetByUsernameAsync(requesterUsername);
            if (requester == null) return (false, "user_not_found");

            var addressee = await _userRepository.GetByUsernameAsync(addresseeUsername);
            if (addressee == null) return (false, "user_not_found");

            var existing = await _friendshipRepository.GetBetweenUsersAsync(requester.Id, addressee.Id);
            if (existing != null)
                return (false, existing.Status == FriendshipStatus.Accepted ? "already_friends" : "request_exists");

            await _friendshipRepository.AddAsync(new Friendship
            {
                RequesterId = requester.Id,
                AddresseeId = addressee.Id
            });

            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AcceptRequestAsync(string requesterUsername, string addresseeUsername)
        {
            var requester = await _userRepository.GetByUsernameAsync(requesterUsername);
            var addressee = await _userRepository.GetByUsernameAsync(addresseeUsername);
            if (requester == null || addressee == null) return (false, "request_not_found");

            var friendship = await _friendshipRepository.GetByUsersAsync(requester.Id, addressee.Id);
            if (friendship == null) return (false, "request_not_found");

            if (friendship.Status != FriendshipStatus.Pending) return (false, "not_pending");

            friendship.Status = FriendshipStatus.Accepted;
            friendship.UpdatedAt = DateTime.UtcNow;

            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeclineRequestAsync(string requesterUsername, string addresseeUsername)
        {
            var requester = await _userRepository.GetByUsernameAsync(requesterUsername);
            var addressee = await _userRepository.GetByUsernameAsync(addresseeUsername);
            if (requester == null || addressee == null) return (false, "request_not_found");

            var friendship = await _friendshipRepository.GetByUsersAsync(requester.Id, addressee.Id);
            if (friendship == null) return (false, "request_not_found");

            _friendshipRepository.DeleteAsync(friendship);
            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> RemoveConnectionAsync(string usernameA, string usernameB)
        {
            var userA = await _userRepository.GetByUsernameAsync(usernameA);
            var userB = await _userRepository.GetByUsernameAsync(usernameB);
            if (userA == null || userB == null) return (false, "user_not_found");

            var friendship = await _friendshipRepository.GetBetweenUsersAsync(userA.Id, userB.Id);
            if (friendship == null) return (false, "not_friends");

            _friendshipRepository.DeleteAsync(friendship);
            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }
    }
}
