using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;
using NetTopologySuite.Geometries;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class SensorServiceTests
    {
        private Mock<ISensorRepository> _sensorRepoMock = null!;
        private SensorService _sut = null!;

        [TestInitialize]
        public void Setup()
        {
            _sensorRepoMock = new Mock<ISensorRepository>();
            _sut = new SensorService(_sensorRepoMock.Object);
        }

        // ── CreateAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task CreateAsync_ValidRequest_ReturnsSensorFromRepository()
        {
            var stored = new Sensor { Id = 1, SensorName = "Sensor Alpha", Geo = new Point(16.37, 48.21) { SRID = 4326 } };
            _sensorRepoMock.Setup(r => r.CreateAsync(It.IsAny<Sensor>())).ReturnsAsync(stored);

            var result = await _sut.CreateAsync(new CreateSensorRequest
            {
                SensorName = "Sensor Alpha",
                Longitude = 16.37,
                Latitude = 48.21
            });

            Assert.IsNotNull(result);
            Assert.AreEqual(1L, result.Id);
            Assert.AreEqual("Sensor Alpha", result.SensorName);
        }

        [TestMethod]
        public async Task CreateAsync_ValidRequest_BuildsPointWithCorrectCoordinates()
        {
            Sensor? capturedSensor = null;
            _sensorRepoMock.Setup(r => r.CreateAsync(It.IsAny<Sensor>()))
                .Callback<Sensor>(s => capturedSensor = s)
                .ReturnsAsync((Sensor s) => s);

            await _sut.CreateAsync(new CreateSensorRequest
            {
                SensorName = "Test",
                Longitude = 10.5,
                Latitude = 50.5
            });

            Assert.IsNotNull(capturedSensor);
            Assert.AreEqual(10.5, capturedSensor!.Geo.X, 0.0001);
            Assert.AreEqual(50.5, capturedSensor.Geo.Y, 0.0001);
            Assert.AreEqual(4326, capturedSensor.Geo.SRID);
        }

        [TestMethod]
        public async Task CreateAsync_ValidRequest_SensorNameIsPreserved()
        {
            Sensor? capturedSensor = null;
            _sensorRepoMock.Setup(r => r.CreateAsync(It.IsAny<Sensor>()))
                .Callback<Sensor>(s => capturedSensor = s)
                .ReturnsAsync((Sensor s) => s);

            await _sut.CreateAsync(new CreateSensorRequest
            {
                SensorName = "Oak Tree Sensor",
                Longitude = 0,
                Latitude = 0
            });

            Assert.AreEqual("Oak Tree Sensor", capturedSensor!.SensorName);
        }

        // ── UpdateAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task UpdateAsync_ExistingSensor_ReturnsSuccessAndUpdatesValues()
        {
            var sensor = new Sensor { Id = 5, SensorName = "Old Name", Geo = new Point(0, 0) { SRID = 4326 } };
            _sensorRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(sensor);
            _sensorRepoMock.Setup(r => r.UpdateAsync(sensor)).ReturnsAsync(true);

            var (success, error) = await _sut.UpdateAsync(5, new UpdateSensorRequest
            {
                SensorName = "New Name",
                Longitude = 12.0,
                Latitude = 47.0
            });

            Assert.IsTrue(success);
            Assert.IsNull(error);
            Assert.AreEqual("New Name", sensor.SensorName);
            Assert.AreEqual(12.0, sensor.Geo.X, 0.0001);
            Assert.AreEqual(47.0, sensor.Geo.Y, 0.0001);
        }

        [TestMethod]
        public async Task UpdateAsync_SensorNotFound_ReturnsNotFoundError()
        {
            _sensorRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<long>())).ReturnsAsync((Sensor?)null);

            var (success, error) = await _sut.UpdateAsync(999, new UpdateSensorRequest
            {
                SensorName = "X",
                Longitude = 0,
                Latitude = 0
            });

            Assert.IsFalse(success);
            Assert.AreEqual("not_found", error);
            _sensorRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Sensor>()), Times.Never);
        }

        [TestMethod]
        public async Task UpdateAsync_ExistingSensor_PointSridIs4326()
        {
            var sensor = new Sensor { Id = 1, SensorName = "S", Geo = new Point(0, 0) { SRID = 4326 } };
            _sensorRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(sensor);
            _sensorRepoMock.Setup(r => r.UpdateAsync(sensor)).ReturnsAsync(true);

            await _sut.UpdateAsync(1, new UpdateSensorRequest { SensorName = "S", Longitude = 5.0, Latitude = 5.0 });

            Assert.AreEqual(4326, sensor.Geo.SRID);
        }

        // ── DeleteAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task DeleteAsync_ExistingSensor_ReturnsSuccess()
        {
            _sensorRepoMock.Setup(r => r.DeleteAsync(7)).ReturnsAsync(true);

            var (success, error) = await _sut.DeleteAsync(7);

            Assert.IsTrue(success);
            Assert.IsNull(error);
        }

        [TestMethod]
        public async Task DeleteAsync_NonExistentSensor_ReturnsNotFoundError()
        {
            _sensorRepoMock.Setup(r => r.DeleteAsync(It.IsAny<long>())).ReturnsAsync(false);

            var (success, error) = await _sut.DeleteAsync(404);

            Assert.IsFalse(success);
            Assert.AreEqual("not_found", error);
        }

        [TestMethod]
        public async Task DeleteAsync_CallsRepositoryDeleteWithCorrectId()
        {
            _sensorRepoMock.Setup(r => r.DeleteAsync(42)).ReturnsAsync(true);

            await _sut.DeleteAsync(42);

            _sensorRepoMock.Verify(r => r.DeleteAsync(42), Times.Once);
        }
    }
}
