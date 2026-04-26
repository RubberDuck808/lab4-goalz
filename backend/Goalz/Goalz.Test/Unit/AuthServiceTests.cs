using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class AuthServiceTests
    {
        private Mock<IAuthRepository> _authRepoMock = null!;
        private AuthService _sut = null!;

        [TestInitialize]
        public void Setup()
        {
            _authRepoMock = new Mock<IAuthRepository>();
            _sut = new AuthService(_authRepoMock.Object);
        }

        // ── CheckAuth ────────────────────────────────────────────────────────────

        [TestMethod]
        public async Task CheckAuth_ValidCredentials_ReturnsDashboardLoginResponse()
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("staffpass");
            var user = new User
            {
                Email = "staff@example.com",
                Name = "Staff Member",
                Role = Role.Staff,
                PasswordHash = hash
            };
            _authRepoMock.Setup(r => r.GetUserByEmail("staff@example.com")).ReturnsAsync(user);

            var result = await _sut.CheckAuth("staff@example.com", "staffpass");

            Assert.IsNotNull(result);
            Assert.AreEqual("staff@example.com", result.Email);
            Assert.AreEqual("Staff Member", result.Name);
            Assert.AreEqual("Staff", result.Role);
        }

        [TestMethod]
        public async Task CheckAuth_UserNotFound_ReturnsNull()
        {
            _authRepoMock.Setup(r => r.GetUserByEmail(It.IsAny<string>())).ReturnsAsync((User?)null);

            var result = await _sut.CheckAuth("nobody@example.com", "pass");

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task CheckAuth_WrongPassword_ReturnsNull()
        {
            var user = new User
            {
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpass"),
                Role = Role.Admin
            };
            _authRepoMock.Setup(r => r.GetUserByEmail("admin@example.com")).ReturnsAsync(user);

            var result = await _sut.CheckAuth("admin@example.com", "wrongpass");

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task CheckAuth_EmptyPassword_ReturnsNull()
        {
            var user = new User
            {
                Email = "a@b.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("real"),
                Role = Role.Staff
            };
            _authRepoMock.Setup(r => r.GetUserByEmail("a@b.com")).ReturnsAsync(user);

            var result = await _sut.CheckAuth("a@b.com", string.Empty);

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task CheckAuth_AdminRole_ReturnsAdminRoleInResponse()
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("adminpass");
            var user = new User { Email = "adm@x.com", Name = "Admin", Role = Role.Admin, PasswordHash = hash };
            _authRepoMock.Setup(r => r.GetUserByEmail("adm@x.com")).ReturnsAsync(user);

            var result = await _sut.CheckAuth("adm@x.com", "adminpass");

            Assert.IsNotNull(result);
            Assert.AreEqual("Admin", result.Role);
        }

        // ── CreateStaffUserAsync ─────────────────────────────────────────────────

        [TestMethod]
        public async Task CreateStaffUserAsync_AdminCreatesUser_ReturnsStaffUserResponse()
        {
            var admin = new User { Email = "admin@example.com", Role = Role.Admin, PasswordHash = "h" };
            _authRepoMock.Setup(r => r.GetUserByEmail("admin@example.com")).ReturnsAsync(admin);
            _authRepoMock.Setup(r => r.GetUserByEmail("newstaff@example.com")).ReturnsAsync((User?)null);
            _authRepoMock.Setup(r => r.CreateUserAsync(It.IsAny<User>()))
                .ReturnsAsync((User u) => u);

            var (result, error) = await _sut.CreateStaffUserAsync(new CreateStaffUserRequest
            {
                AdminEmail = "admin@example.com",
                Email = "newstaff@example.com",
                Name = "New Staff",
                Password = "staffpass"
            });

            Assert.IsNotNull(result);
            Assert.IsNull(error);
            Assert.AreEqual("newstaff@example.com", result.Email);
            Assert.AreEqual("New Staff", result.Name);
            Assert.AreEqual("Staff", result.Role);
        }

        [TestMethod]
        public async Task CreateStaffUserAsync_RequesterIsStaffNotAdmin_ReturnsUnauthorizedError()
        {
            var staff = new User { Email = "staff@example.com", Role = Role.Staff };
            _authRepoMock.Setup(r => r.GetUserByEmail("staff@example.com")).ReturnsAsync(staff);

            var (result, error) = await _sut.CreateStaffUserAsync(new CreateStaffUserRequest
            {
                AdminEmail = "staff@example.com",
                Email = "x@x.com",
                Name = "x",
                Password = "x"
            });

            Assert.IsNull(result);
            Assert.AreEqual("unauthorized", error);
        }

        [TestMethod]
        public async Task CreateStaffUserAsync_AdminEmailNotFound_ReturnsUnauthorizedError()
        {
            _authRepoMock.Setup(r => r.GetUserByEmail(It.IsAny<string>())).ReturnsAsync((User?)null);

            var (result, error) = await _sut.CreateStaffUserAsync(new CreateStaffUserRequest
            {
                AdminEmail = "ghost@example.com",
                Email = "x@x.com",
                Name = "x",
                Password = "x"
            });

            Assert.IsNull(result);
            Assert.AreEqual("unauthorized", error);
        }

        [TestMethod]
        public async Task CreateStaffUserAsync_NewEmailAlreadyExists_ReturnsEmailTakenError()
        {
            var admin = new User { Email = "admin@example.com", Role = Role.Admin };
            var existing = new User { Email = "taken@example.com", Role = Role.Staff };
            _authRepoMock.Setup(r => r.GetUserByEmail("admin@example.com")).ReturnsAsync(admin);
            _authRepoMock.Setup(r => r.GetUserByEmail("taken@example.com")).ReturnsAsync(existing);

            var (result, error) = await _sut.CreateStaffUserAsync(new CreateStaffUserRequest
            {
                AdminEmail = "admin@example.com",
                Email = "taken@example.com",
                Name = "Dupe",
                Password = "p"
            });

            Assert.IsNull(result);
            Assert.AreEqual("email_taken", error);
        }

        [TestMethod]
        public async Task CreateStaffUserAsync_NewUser_PasswordIsHashedBeforePersist()
        {
            var admin = new User { Email = "admin@example.com", Role = Role.Admin };
            _authRepoMock.Setup(r => r.GetUserByEmail("admin@example.com")).ReturnsAsync(admin);
            _authRepoMock.Setup(r => r.GetUserByEmail("fresh@example.com")).ReturnsAsync((User?)null);

            User? capturedUser = null;
            _authRepoMock.Setup(r => r.CreateUserAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .ReturnsAsync((User u) => u);

            await _sut.CreateStaffUserAsync(new CreateStaffUserRequest
            {
                AdminEmail = "admin@example.com",
                Email = "fresh@example.com",
                Name = "Fresh",
                Password = "plaintext"
            });

            Assert.IsNotNull(capturedUser);
            Assert.AreNotEqual("plaintext", capturedUser!.PasswordHash);
            Assert.IsTrue(BCrypt.Net.BCrypt.Verify("plaintext", capturedUser.PasswordHash));
        }

        [TestMethod]
        public async Task CreateStaffUserAsync_NewUser_RoleIsSetToStaff()
        {
            var admin = new User { Email = "admin@example.com", Role = Role.Admin };
            _authRepoMock.Setup(r => r.GetUserByEmail("admin@example.com")).ReturnsAsync(admin);
            _authRepoMock.Setup(r => r.GetUserByEmail("s@s.com")).ReturnsAsync((User?)null);

            User? capturedUser = null;
            _authRepoMock.Setup(r => r.CreateUserAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u)
                .ReturnsAsync((User u) => u);

            await _sut.CreateStaffUserAsync(new CreateStaffUserRequest
            {
                AdminEmail = "admin@example.com",
                Email = "s@s.com",
                Name = "S",
                Password = "p"
            });

            Assert.AreEqual(Role.Staff, capturedUser!.Role);
        }
    }
}
