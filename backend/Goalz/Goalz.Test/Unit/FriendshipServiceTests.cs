using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class FriendshipServiceTests
    {
        private Mock<IFriendshipRepository> _friendshipRepoMock = null!;
        private Mock<IUserRepository> _userRepoMock = null!;
        private FriendshipService _sut = null!;

        private static User MakeUser(long id, string username) =>
            new() { Id = id, Username = username, Email = $"{username}@test.com" };

        private static Friendship MakeFriendship(long id, User requester, User addressee, FriendshipStatus status = FriendshipStatus.Accepted) =>
            new()
            {
                Id = id,
                RequesterId = requester.Id,
                Requester = requester,
                AddresseeId = addressee.Id,
                Addressee = addressee,
                Status = status
            };

        [TestInitialize]
        public void Setup()
        {
            _friendshipRepoMock = new Mock<IFriendshipRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _sut = new FriendshipService(_friendshipRepoMock.Object, _userRepoMock.Object);
        }

        // ── GetConnectionsAsync ──────────────────────────────────────────────────

        [TestMethod]
        public async Task GetConnectionsAsync_UserWithFriends_ReturnsFriendDtoList()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var friendship = MakeFriendship(10, alice, bob);

            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _friendshipRepoMock.Setup(r => r.GetAcceptedAsync(1)).ReturnsAsync(new[] { friendship });

            var result = (await _sut.GetConnectionsAsync("alice")).ToList();

            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("bob", result[0].Username);
            Assert.AreEqual(10L, result[0].FriendshipId);
        }

        [TestMethod]
        public async Task GetConnectionsAsync_UserNotFound_ReturnsEmptyList()
        {
            _userRepoMock.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

            var result = await _sut.GetConnectionsAsync("ghost");

            Assert.AreEqual(0, result.Count());
        }

        [TestMethod]
        public async Task GetConnectionsAsync_RequesterIsFriendshipAddresseeSide_ReturnsRequesterAsPartner()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            // alice is the addressee here — partner should be bob (requester)
            var friendship = MakeFriendship(11, bob, alice);

            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _friendshipRepoMock.Setup(r => r.GetAcceptedAsync(1)).ReturnsAsync(new[] { friendship });

            var result = (await _sut.GetConnectionsAsync("alice")).ToList();

            Assert.AreEqual("bob", result[0].Username);
        }

        // ── GetRequestsAsync ─────────────────────────────────────────────────────

        [TestMethod]
        public async Task GetRequestsAsync_UserWithPendingRequests_ReturnsFriendDtoList()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var pending = MakeFriendship(20, bob, alice, FriendshipStatus.Pending);

            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _friendshipRepoMock.Setup(r => r.GetPendingReceivedAsync(1)).ReturnsAsync(new[] { pending });

            var result = (await _sut.GetRequestsAsync("alice")).ToList();

            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("bob", result[0].Username);
        }

        [TestMethod]
        public async Task GetRequestsAsync_UserNotFound_ReturnsEmptyList()
        {
            _userRepoMock.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

            var result = await _sut.GetRequestsAsync("ghost");

            Assert.AreEqual(0, result.Count());
        }

        // ── SendRequestAsync ─────────────────────────────────────────────────────

        [TestMethod]
        public async Task SendRequestAsync_ValidUsers_ReturnsSuccessWithNoError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetBetweenUsersAsync(1, 2)).ReturnsAsync((Friendship?)null);
            _friendshipRepoMock.Setup(r => r.AddAsync(It.IsAny<Friendship>())).Returns(Task.CompletedTask);
            _friendshipRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, error) = await _sut.SendRequestAsync("alice", "bob");

            Assert.IsTrue(success);
            Assert.IsNull(error);
        }

        [TestMethod]
        public async Task SendRequestAsync_SelfAdd_ReturnsCannotSelfAddError()
        {
            var (success, error) = await _sut.SendRequestAsync("alice", "alice");

            Assert.IsFalse(success);
            Assert.AreEqual("cannot_self_add", error);
            _userRepoMock.Verify(r => r.GetByUsernameAsync(It.IsAny<string>()), Times.Never);
        }

        [TestMethod]
        public async Task SendRequestAsync_SelfAddCaseInsensitive_ReturnsCannotSelfAddError()
        {
            var (success, error) = await _sut.SendRequestAsync("Alice", "alice");

            Assert.IsFalse(success);
            Assert.AreEqual("cannot_self_add", error);
        }

        [TestMethod]
        public async Task SendRequestAsync_RequesterNotFound_ReturnsUserNotFoundError()
        {
            _userRepoMock.Setup(r => r.GetByUsernameAsync("ghost")).ReturnsAsync((User?)null);

            var (success, error) = await _sut.SendRequestAsync("ghost", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("user_not_found", error);
        }

        [TestMethod]
        public async Task SendRequestAsync_AddresseeNotFound_ReturnsUserNotFoundError()
        {
            var alice = MakeUser(1, "alice");
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("ghost")).ReturnsAsync((User?)null);

            var (success, error) = await _sut.SendRequestAsync("alice", "ghost");

            Assert.IsFalse(success);
            Assert.AreEqual("user_not_found", error);
        }

        [TestMethod]
        public async Task SendRequestAsync_AlreadyFriends_ReturnsAlreadyFriendsError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var existing = MakeFriendship(5, alice, bob, FriendshipStatus.Accepted);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetBetweenUsersAsync(1, 2)).ReturnsAsync(existing);

            var (success, error) = await _sut.SendRequestAsync("alice", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("already_friends", error);
        }

        [TestMethod]
        public async Task SendRequestAsync_RequestAlreadyPending_ReturnsRequestExistsError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var existing = MakeFriendship(5, alice, bob, FriendshipStatus.Pending);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetBetweenUsersAsync(1, 2)).ReturnsAsync(existing);

            var (success, error) = await _sut.SendRequestAsync("alice", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("request_exists", error);
        }

        [TestMethod]
        public async Task SendRequestAsync_ValidUsers_PersistsFriendshipWithCorrectIds()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            Friendship? captured = null;
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetBetweenUsersAsync(1, 2)).ReturnsAsync((Friendship?)null);
            _friendshipRepoMock.Setup(r => r.AddAsync(It.IsAny<Friendship>()))
                .Callback<Friendship>(f => captured = f)
                .Returns(Task.CompletedTask);
            _friendshipRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            await _sut.SendRequestAsync("alice", "bob");

            Assert.IsNotNull(captured);
            Assert.AreEqual(1L, captured!.RequesterId);
            Assert.AreEqual(2L, captured.AddresseeId);
        }

        // ── AcceptRequestAsync ───────────────────────────────────────────────────

        [TestMethod]
        public async Task AcceptRequestAsync_ValidPendingRequest_ReturnsSuccessAndSetsStatusAccepted()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var friendship = MakeFriendship(30, alice, bob, FriendshipStatus.Pending);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetByUsersAsync(1, 2)).ReturnsAsync(friendship);
            _friendshipRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, error) = await _sut.AcceptRequestAsync("alice", "bob");

            Assert.IsTrue(success);
            Assert.IsNull(error);
            Assert.AreEqual(FriendshipStatus.Accepted, friendship.Status);
            Assert.IsNotNull(friendship.UpdatedAt);
        }

        [TestMethod]
        public async Task AcceptRequestAsync_RequesterNotFound_ReturnsRequestNotFoundError()
        {
            _userRepoMock.Setup(r => r.GetByUsernameAsync("ghost")).ReturnsAsync((User?)null);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(MakeUser(2, "bob"));

            var (success, error) = await _sut.AcceptRequestAsync("ghost", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("request_not_found", error);
        }

        [TestMethod]
        public async Task AcceptRequestAsync_FriendshipRecordNotFound_ReturnsRequestNotFoundError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetByUsersAsync(1, 2)).ReturnsAsync((Friendship?)null);

            var (success, error) = await _sut.AcceptRequestAsync("alice", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("request_not_found", error);
        }

        [TestMethod]
        public async Task AcceptRequestAsync_RequestAlreadyAccepted_ReturnsNotPendingError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var friendship = MakeFriendship(5, alice, bob, FriendshipStatus.Accepted);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetByUsersAsync(1, 2)).ReturnsAsync(friendship);

            var (success, error) = await _sut.AcceptRequestAsync("alice", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("not_pending", error);
        }

        // ── DeclineRequestAsync ──────────────────────────────────────────────────

        [TestMethod]
        public async Task DeclineRequestAsync_ValidRequest_ReturnsSuccessAndDeletesFriendship()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var friendship = MakeFriendship(40, alice, bob, FriendshipStatus.Pending);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetByUsersAsync(1, 2)).ReturnsAsync(friendship);
            _friendshipRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, error) = await _sut.DeclineRequestAsync("alice", "bob");

            Assert.IsTrue(success);
            Assert.IsNull(error);
            _friendshipRepoMock.Verify(r => r.DeleteAsync(friendship), Times.Once);
        }

        [TestMethod]
        public async Task DeclineRequestAsync_RequestNotFound_ReturnsRequestNotFoundError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetByUsersAsync(1, 2)).ReturnsAsync((Friendship?)null);

            var (success, error) = await _sut.DeclineRequestAsync("alice", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("request_not_found", error);
        }

        // ── RemoveConnectionAsync ────────────────────────────────────────────────

        [TestMethod]
        public async Task RemoveConnectionAsync_ExistingConnection_ReturnsSuccessAndDeletesFriendship()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            var friendship = MakeFriendship(50, alice, bob);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetBetweenUsersAsync(1, 2)).ReturnsAsync(friendship);
            _friendshipRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, error) = await _sut.RemoveConnectionAsync("alice", "bob");

            Assert.IsTrue(success);
            Assert.IsNull(error);
            _friendshipRepoMock.Verify(r => r.DeleteAsync(friendship), Times.Once);
        }

        [TestMethod]
        public async Task RemoveConnectionAsync_UserNotFound_ReturnsUserNotFoundError()
        {
            _userRepoMock.Setup(r => r.GetByUsernameAsync("ghost")).ReturnsAsync((User?)null);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(MakeUser(2, "bob"));

            var (success, error) = await _sut.RemoveConnectionAsync("ghost", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("user_not_found", error);
        }

        [TestMethod]
        public async Task RemoveConnectionAsync_NoConnectionExists_ReturnsNotFriendsError()
        {
            var alice = MakeUser(1, "alice");
            var bob = MakeUser(2, "bob");
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(alice);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(bob);
            _friendshipRepoMock.Setup(r => r.GetBetweenUsersAsync(1, 2)).ReturnsAsync((Friendship?)null);

            var (success, error) = await _sut.RemoveConnectionAsync("alice", "bob");

            Assert.IsFalse(success);
            Assert.AreEqual("not_friends", error);
        }
    }
}
