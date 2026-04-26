using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class PartyServiceTests
    {
        private Mock<IPartyRepository> _partyRepoMock = null!;
        private Mock<IUserRepository> _userRepoMock = null!;
        private PartyService _sut = null!;

        [TestInitialize]
        public void Setup()
        {
            _partyRepoMock = new Mock<IPartyRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _sut = new PartyService(_userRepoMock.Object, _partyRepoMock.Object);
        }

        // ── CreateParty ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task CreateParty_ValidRequest_ReturnsPartyResponseWithIdAndCode()
        {
            _partyRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Party>()))
                .ReturnsAsync((Party p) => { p.Id = 42; return p; });
            _partyRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _partyRepoMock.Setup(r => r.AddGroupAsync(It.IsAny<PartyGroup>())).Returns(Task.CompletedTask);

            var result = await _sut.CreateParty(new PartyRequest { Name = "Biology Class" });

            Assert.IsNotNull(result);
            Assert.AreEqual(42L, result.Id);
            Assert.AreEqual("Biology Class", result.Name);
            Assert.IsTrue(result.Code >= 100000 && result.Code <= 999999);
        }

        [TestMethod]
        public async Task CreateParty_ValidRequest_CreatesFourDefaultGroups()
        {
            _partyRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Party>()))
                .ReturnsAsync((Party p) => { p.Id = 1; return p; });
            _partyRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _partyRepoMock.Setup(r => r.AddGroupAsync(It.IsAny<PartyGroup>())).Returns(Task.CompletedTask);

            await _sut.CreateParty(new PartyRequest { Name = "Test Party" });

            _partyRepoMock.Verify(r => r.AddGroupAsync(It.IsAny<PartyGroup>()), Times.Exactly(4));
        }

        [TestMethod]
        public async Task CreateParty_ValidRequest_GroupNamesAreTeamAToD()
        {
            var capturedGroups = new List<PartyGroup>();
            _partyRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Party>()))
                .ReturnsAsync((Party p) => { p.Id = 1; return p; });
            _partyRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _partyRepoMock.Setup(r => r.AddGroupAsync(It.IsAny<PartyGroup>()))
                .Callback<PartyGroup>(g => capturedGroups.Add(g))
                .Returns(Task.CompletedTask);

            await _sut.CreateParty(new PartyRequest { Name = "P" });

            CollectionAssert.AreEquivalent(
                new[] { "Team A", "Team B", "Team C", "Team D" },
                capturedGroups.Select(g => g.Name).ToArray());
        }

        [TestMethod]
        public async Task CreateParty_ValidRequest_SaveChangesCalledTwice()
        {
            _partyRepoMock
                .Setup(r => r.CreateAsync(It.IsAny<Party>()))
                .ReturnsAsync((Party p) => { p.Id = 1; return p; });
            _partyRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);
            _partyRepoMock.Setup(r => r.AddGroupAsync(It.IsAny<PartyGroup>())).Returns(Task.CompletedTask);

            await _sut.CreateParty(new PartyRequest { Name = "P" });

            _partyRepoMock.Verify(r => r.SaveChangesAsync(), Times.Exactly(2));
        }

        // ── GetParty ─────────────────────────────────────────────────────────────

        [TestMethod]
        public async Task GetParty_ExistingParty_ReturnsMappedPartyResponse()
        {
            var party = new Party { Id = 7, Name = "Science Trip", Code = 123456 };
            _partyRepoMock.Setup(r => r.GetPartyById(7)).ReturnsAsync(party);

            var result = await _sut.GetParty(7);

            Assert.IsNotNull(result);
            Assert.AreEqual(7L, result.Id);
            Assert.AreEqual("Science Trip", result.Name);
            Assert.AreEqual(123456L, result.Code);
        }

        [TestMethod]
        public async Task GetParty_NonExistentParty_ThrowsException()
        {
            _partyRepoMock.Setup(r => r.GetPartyById(It.IsAny<long>())).ReturnsAsync((Party?)null);

            await Assert.ThrowsExceptionAsync<Exception>(() => _sut.GetParty(999));
        }

        // ── JoinParty ────────────────────────────────────────────────────────────

        [TestMethod]
        public async Task JoinParty_ValidCodeAndUser_ReturnsPartyResponse()
        {
            var party = new Party { Id = 1, Name = "Biology", Code = 555555 };
            var user = new User { Id = 10, Username = "bob" };
            var group = new PartyGroup { Id = 5, PartyId = 1 };

            _partyRepoMock.Setup(r => r.GetPartyByCode(555555)).ReturnsAsync(party);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("bob")).ReturnsAsync(user);
            _partyRepoMock.Setup(r => r.GetPartyGroupByPartyIdAsync(1)).ReturnsAsync(group);
            _partyRepoMock.Setup(r => r.AddMemberAsync(It.IsAny<PartyMember>()))
                .ReturnsAsync((PartyMember m) => m);
            _partyRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var result = await _sut.JoinParty(555555, "bob");

            Assert.IsNotNull(result);
            Assert.AreEqual(1L, result.Id);
            Assert.AreEqual("Biology", result.Name);
        }

        [TestMethod]
        public async Task JoinParty_InvalidCode_ThrowsException()
        {
            _partyRepoMock.Setup(r => r.GetPartyByCode(It.IsAny<long>())).ReturnsAsync((Party?)null);

            await Assert.ThrowsExceptionAsync<Exception>(() => _sut.JoinParty(000001, "alice"));
        }

        [TestMethod]
        public async Task JoinParty_UserNotFound_ThrowsException()
        {
            var party = new Party { Id = 1, Code = 111111 };
            _partyRepoMock.Setup(r => r.GetPartyByCode(111111)).ReturnsAsync(party);
            _userRepoMock.Setup(r => r.GetByUsernameAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

            await Assert.ThrowsExceptionAsync<Exception>(() => _sut.JoinParty(111111, "nobody"));
        }

        [TestMethod]
        public async Task JoinParty_PartyGroupNotFound_ThrowsException()
        {
            var party = new Party { Id = 1, Code = 222222 };
            var user = new User { Id = 5, Username = "alice" };
            _partyRepoMock.Setup(r => r.GetPartyByCode(222222)).ReturnsAsync(party);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("alice")).ReturnsAsync(user);
            _partyRepoMock.Setup(r => r.GetPartyGroupByPartyIdAsync(1)).ReturnsAsync((PartyGroup?)null);

            await Assert.ThrowsExceptionAsync<Exception>(() => _sut.JoinParty(222222, "alice"));
        }

        [TestMethod]
        public async Task JoinParty_ValidData_MemberCreatedWithCorrectIds()
        {
            var party = new Party { Id = 3, Code = 333333 };
            var user = new User { Id = 9, Username = "carol" };
            var group = new PartyGroup { Id = 6, PartyId = 3 };

            PartyMember? capturedMember = null;
            _partyRepoMock.Setup(r => r.GetPartyByCode(333333)).ReturnsAsync(party);
            _userRepoMock.Setup(r => r.GetByUsernameAsync("carol")).ReturnsAsync(user);
            _partyRepoMock.Setup(r => r.GetPartyGroupByPartyIdAsync(3)).ReturnsAsync(group);
            _partyRepoMock.Setup(r => r.AddMemberAsync(It.IsAny<PartyMember>()))
                .Callback<PartyMember>(m => capturedMember = m)
                .ReturnsAsync((PartyMember m) => m);
            _partyRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            await _sut.JoinParty(333333, "carol");

            Assert.IsNotNull(capturedMember);
            Assert.AreEqual(9L, capturedMember!.UserId);
            Assert.AreEqual(6L, capturedMember.PartyGroupId);
        }
    }
}
