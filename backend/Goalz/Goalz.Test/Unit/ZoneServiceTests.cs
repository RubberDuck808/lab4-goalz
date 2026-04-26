using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;
using NetTopologySuite.Geometries;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class ZoneServiceTests
    {
        private Mock<IZoneRepository> _zoneRepoMock = null!;
        private ZoneService _sut = null!;

        private static Geometry SampleBoundary() => new Point(10.0, 48.0) { SRID = 4326 };

        [TestInitialize]
        public void Setup()
        {
            _zoneRepoMock = new Mock<IZoneRepository>();
            _sut = new ZoneService(_zoneRepoMock.Object);
        }

        // ── GetAllAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task GetAllAsync_ZonesExist_ReturnsMappedZoneDtos()
        {
            var boundary = SampleBoundary();
            var zones = new[]
            {
                new Zone { Id = 1, Name = "Main Path", ZoneType = "path", Color = "#FF0000", Boundary = boundary },
                new Zone { Id = 2, Name = "Garden",    ZoneType = "area", Color = "#00FF00", Boundary = boundary }
            };
            _zoneRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(zones);

            var result = (await _sut.GetAllAsync()).ToList();

            Assert.AreEqual(2, result.Count);
            Assert.AreEqual("Main Path", result[0].Name);
            Assert.AreEqual("path", result[0].ZoneType);
            Assert.AreEqual("#FF0000", result[0].Color);
            Assert.AreEqual(1L, result[0].Id);
        }

        [TestMethod]
        public async Task GetAllAsync_NoZones_ReturnsEmptyCollection()
        {
            _zoneRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(Array.Empty<Zone>());

            var result = await _sut.GetAllAsync();

            Assert.AreEqual(0, result.Count());
        }

        [TestMethod]
        public async Task GetAllAsync_MapsGeometryBoundaryToDto()
        {
            var boundary = SampleBoundary();
            var zones = new[] { new Zone { Id = 1, Name = "Z", ZoneType = "boundary", Color = "#000", Boundary = boundary } };
            _zoneRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(zones);

            var result = (await _sut.GetAllAsync()).First();

            Assert.AreSame(boundary, result.Boundary);
        }

        // ── CreateAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task CreateAsync_ValidDto_ReturnsSuccessAndPersistsZone()
        {
            _zoneRepoMock.Setup(r => r.AddAsync(It.IsAny<Zone>())).Returns(Task.CompletedTask);
            _zoneRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, error) = await _sut.CreateAsync(new CreateZoneDto
            {
                Name = "Nature Trail",
                ZoneType = "path",
                Color = "#33A661",
                Boundary = SampleBoundary()
            });

            Assert.IsTrue(success);
            Assert.IsNull(error);
            _zoneRepoMock.Verify(r => r.AddAsync(It.IsAny<Zone>()), Times.Once);
            _zoneRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [TestMethod]
        public async Task CreateAsync_EmptyName_ReturnsInvalidNameError()
        {
            var (success, error) = await _sut.CreateAsync(new CreateZoneDto
            {
                Name = "   ",
                ZoneType = "area",
                Boundary = SampleBoundary()
            });

            Assert.IsFalse(success);
            Assert.AreEqual("invalid_name", error);
            _zoneRepoMock.Verify(r => r.AddAsync(It.IsAny<Zone>()), Times.Never);
        }

        [TestMethod]
        public async Task CreateAsync_InvalidZoneType_ReturnsInvalidZoneTypeError()
        {
            var (success, error) = await _sut.CreateAsync(new CreateZoneDto
            {
                Name = "Zone X",
                ZoneType = "galaxy",
                Boundary = SampleBoundary()
            });

            Assert.IsFalse(success);
            Assert.AreEqual("invalid_zone_type", error);
        }

        [TestMethod]
        [DataRow("boundary")]
        [DataRow("area")]
        [DataRow("path")]
        public async Task CreateAsync_ValidZoneType_ReturnsSuccess(string zoneType)
        {
            _zoneRepoMock.Setup(r => r.AddAsync(It.IsAny<Zone>())).Returns(Task.CompletedTask);
            _zoneRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, _) = await _sut.CreateAsync(new CreateZoneDto
            {
                Name = "Test Zone",
                ZoneType = zoneType,
                Boundary = SampleBoundary()
            });

            Assert.IsTrue(success);
        }

        [TestMethod]
        public async Task CreateAsync_NullBoundary_ReturnsInvalidGeometryError()
        {
            var (success, error) = await _sut.CreateAsync(new CreateZoneDto
            {
                Name = "Zone",
                ZoneType = "area",
                Boundary = null!
            });

            Assert.IsFalse(success);
            Assert.AreEqual("invalid_geometry", error);
        }

        // ── UpdateAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task UpdateAsync_ValidDto_ReturnsSuccessAndPersistsChanges()
        {
            var zone = new Zone { Id = 1, Name = "Old", ZoneType = "area", Color = "#FFF", Boundary = SampleBoundary() };
            _zoneRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(zone);
            _zoneRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var (success, error) = await _sut.UpdateAsync(1, new UpdateZoneDto
            {
                Name = "New Name",
                ZoneType = "path",
                Color = "#123456"
            });

            Assert.IsTrue(success);
            Assert.IsNull(error);
            Assert.AreEqual("New Name", zone.Name);
            Assert.AreEqual("path", zone.ZoneType);
            Assert.AreEqual("#123456", zone.Color);
        }

        [TestMethod]
        public async Task UpdateAsync_ZoneNotFound_ReturnsNotFoundError()
        {
            _zoneRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<long>())).ReturnsAsync((Zone?)null);

            var (success, error) = await _sut.UpdateAsync(999, new UpdateZoneDto
            {
                Name = "X",
                ZoneType = "area"
            });

            Assert.IsFalse(success);
            Assert.AreEqual("not_found", error);
        }

        [TestMethod]
        public async Task UpdateAsync_EmptyName_ReturnsInvalidNameError()
        {
            var zone = new Zone { Id = 1, Name = "Old", ZoneType = "area", Boundary = SampleBoundary() };
            _zoneRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(zone);

            var (success, error) = await _sut.UpdateAsync(1, new UpdateZoneDto { Name = "", ZoneType = "area" });

            Assert.IsFalse(success);
            Assert.AreEqual("invalid_name", error);
        }

        [TestMethod]
        public async Task UpdateAsync_InvalidZoneType_ReturnsInvalidZoneTypeError()
        {
            var zone = new Zone { Id = 1, Name = "Z", ZoneType = "area", Boundary = SampleBoundary() };
            _zoneRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(zone);

            var (success, error) = await _sut.UpdateAsync(1, new UpdateZoneDto { Name = "Z", ZoneType = "unknown" });

            Assert.IsFalse(success);
            Assert.AreEqual("invalid_zone_type", error);
        }

        [TestMethod]
        public async Task UpdateAsync_NewBoundaryProvided_ReplacesBoundary()
        {
            var oldBoundary = SampleBoundary();
            var newBoundary = new Point(20.0, 50.0) { SRID = 4326 };
            var zone = new Zone { Id = 1, Name = "Z", ZoneType = "area", Boundary = oldBoundary };
            _zoneRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(zone);
            _zoneRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            await _sut.UpdateAsync(1, new UpdateZoneDto { Name = "Z", ZoneType = "area", Boundary = newBoundary });

            Assert.AreSame(newBoundary, zone.Boundary);
        }

        [TestMethod]
        public async Task UpdateAsync_NullBoundaryInDto_KeepsExistingBoundary()
        {
            var existing = SampleBoundary();
            var zone = new Zone { Id = 1, Name = "Z", ZoneType = "area", Boundary = existing };
            _zoneRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(zone);
            _zoneRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            await _sut.UpdateAsync(1, new UpdateZoneDto { Name = "Z", ZoneType = "area", Boundary = null });

            Assert.AreSame(existing, zone.Boundary);
        }

        // ── DeleteAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task DeleteAsync_ExistingZone_ReturnsTrue()
        {
            var zone = new Zone { Id = 3, Name = "Z", ZoneType = "area", Boundary = SampleBoundary() };
            _zoneRepoMock.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(zone);
            _zoneRepoMock.Setup(r => r.DeleteAsync(zone)).Returns(Task.CompletedTask);
            _zoneRepoMock.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

            var result = await _sut.DeleteAsync(3);

            Assert.IsTrue(result);
            _zoneRepoMock.Verify(r => r.DeleteAsync(zone), Times.Once);
        }

        [TestMethod]
        public async Task DeleteAsync_NonExistentZone_ReturnsFalse()
        {
            _zoneRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<long>())).ReturnsAsync((Zone?)null);

            var result = await _sut.DeleteAsync(404);

            Assert.IsFalse(result);
            _zoneRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Zone>()), Times.Never);
        }
    }
}
