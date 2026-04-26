using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class UserServiceTests
    {
        private Mock<IUserRepository> _userRepoMock = null!;
        private Mock<IJwtService> _jwtServiceMock = null!;
        private UserService _sut = null!;

        [TestInitialize]
        public void Setup()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _jwtServiceMock = new Mock<IJwtService>();
            _sut = new UserService(_userRepoMock.Object, _jwtServiceMock.Object);
        }

        // ── LoginAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task LoginAsync_ValidCredentials_ReturnsGameLoginResponse()
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("password123");
            var user = new User
            {
                Username = "alice",
                Name = "Alice",
                Email = "alice@example.com",
                PasswordHash = hash,
                Role = Role.Player,
                CreatedAt = DateTime.UtcNow
            };
            _userRepoMock.Setup(r => r.GetByEmailAsync("alice@example.com")).ReturnsAsync(user);
            _jwtServiceMock.Setup(j => j.Generate("alice", "Player")).Returns("jwt-token");

            var result = await _sut.LoginAsync(new GameLoginRequest
            {
                Email = "alice@example.com",
                Password = "password123"
            });

            Assert.IsNotNull(result);
            Assert.AreEqual("jwt-token", result.Token);
            Assert.AreEqual("alice", result.Username);
            Assert.AreEqual("Alice", result.Name);
            Assert.AreEqual("alice@example.com", result.Email);
        }

        [TestMethod]
        public async Task LoginAsync_UserNotFound_ReturnsNull()
        {
            _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

            var result = await _sut.LoginAsync(new GameLoginRequest
            {
                Email = "ghost@example.com",
                Password = "any"
            });

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task LoginAsync_WrongPassword_ReturnsNull()
        {
            var user = new User
            {
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct"),
                Email = "a@b.com",
                Role = Role.Player
            };
            _userRepoMock.Setup(r => r.GetByEmailAsync("a@b.com")).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new GameLoginRequest
            {
                Email = "a@b.com",
                Password = "wrong"
            });

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task LoginAsync_EmptyPassword_ReturnsNull()
        {
            var user = new User
            {
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("secret"),
                Email = "a@b.com",
                Role = Role.Player
            };
            _userRepoMock.Setup(r => r.GetByEmailAsync("a@b.com")).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new GameLoginRequest { Email = "a@b.com", Password = "" });

            Assert.IsNull(result);
        }

        // ── SignUpAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task SignUpAsync_NewUser_ReturnsGameSignUpResponseWithToken()
        {
            _userRepoMock.Setup(r => r.ExistsByEmailAsync("new@example.com")).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.ExistsByUsernameAsync("newuser")).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
            _userRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _jwtServiceMock.Setup(j => j.Generate(It.IsAny<string>(), It.IsAny<string>())).Returns("new-token");

            var (user, error) = await _sut.SignUpAsync(new GameSignUpRequest
            {
                Email = "new@example.com",
                Username = "newuser",
                Name = "New User",
                Password = "secret"
            });

            Assert.IsNotNull(user);
            Assert.IsNull(error);
            Assert.AreEqual("newuser", user.Username);
            Assert.AreEqual("new-token", user.Token);
        }

        [TestMethod]
        public async Task SignUpAsync_EmailAlreadyTaken_ReturnsEmailTakenError()
        {
            _userRepoMock.Setup(r => r.ExistsByEmailAsync("taken@example.com")).ReturnsAsync(true);

            var (user, error) = await _sut.SignUpAsync(new GameSignUpRequest
            {
                Email = "taken@example.com",
                Username = "x",
                Name = "x",
                Password = "x"
            });

            Assert.IsNull(user);
            Assert.AreEqual("email_taken", error);
        }

        [TestMethod]
        public async Task SignUpAsync_UsernameAlreadyTaken_ReturnsUsernameTakenError()
        {
            _userRepoMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>())).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.ExistsByUsernameAsync("takenUser")).ReturnsAsync(true);

            var (user, error) = await _sut.SignUpAsync(new GameSignUpRequest
            {
                Email = "fresh@example.com",
                Username = "takenUser",
                Name = "x",
                Password = "x"
            });

            Assert.IsNull(user);
            Assert.AreEqual("username_taken", error);
        }

        [TestMethod]
        public async Task SignUpAsync_NewUser_PasswordIsHashedBeforePersist()
        {
            User? capturedUser = null;
            _userRepoMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>())).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.ExistsByUsernameAsync(It.IsAny<string>())).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);
            _userRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _jwtServiceMock.Setup(j => j.Generate(It.IsAny<string>(), It.IsAny<string>())).Returns("tok");

            await _sut.SignUpAsync(new GameSignUpRequest
            {
                Email = "u@u.com",
                Username = "u",
                Name = "U",
                Password = "plaintext"
            });

            Assert.IsNotNull(capturedUser);
            Assert.AreNotEqual("plaintext", capturedUser!.PasswordHash);
            Assert.IsTrue(BCrypt.Net.BCrypt.Verify("plaintext", capturedUser.PasswordHash));
        }

        [TestMethod]
        public async Task SignUpAsync_NewUser_RoleIsSetToPlayer()
        {
            User? capturedUser = null;
            _userRepoMock.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>())).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.ExistsByUsernameAsync(It.IsAny<string>())).ReturnsAsync(false);
            _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .Returns(Task.CompletedTask);
            _userRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _jwtServiceMock.Setup(j => j.Generate(It.IsAny<string>(), It.IsAny<string>())).Returns("tok");

            await _sut.SignUpAsync(new GameSignUpRequest
            {
                Email = "p@p.com",
                Username = "player",
                Name = "P",
                Password = "pass"
            });

            Assert.AreEqual(Role.Player, capturedUser!.Role);
        }
    }
}
