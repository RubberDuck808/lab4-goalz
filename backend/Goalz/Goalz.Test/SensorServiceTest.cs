using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Data.Repositories;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Goalz.Test
{
    [TestClass]
    public sealed class SensorServiceTest
    {
        private SensorService _sensorService = null!;
        private AppDbContext _context = null!;
        private ISensorRepository _repository = null!;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _repository = new SensorRepository(_context);
            var stubCheckpointService = new StubCheckpointService();
            var stubSensorDataRepository = new StubSensorDataRepository();
            _sensorService = new SensorService(_repository, stubCheckpointService, stubSensorDataRepository);
        }

        [TestCleanup]
        public void TearDown()
        {
            _context.Dispose();
        }

        [TestMethod]
        public async Task StoreSensorData_ThrowsArgumentNullException_IfSensorDoesNotExist()
        {
            // Arrange
            var dataDto = new SensorDataDto
            {
                SensorId = 999, // Does not exist
                Temperature = 22.5,
                Humidity = 50.0,
                RawMoisture = 2000
            };

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(async () =>
            {
                await _sensorService.StoreSensorData(dataDto);
            });
        }

        [TestMethod]
        public async Task StoreSensorData_SavesDataSuccessfully_IfSensorExists()
        {
            // Arrange
            var sensor = new Sensor
            {
                Id = 1,
                SensorName = "Test Sensor",
                Geo = new Point(10, 20) { SRID = 4326 }
            };
            _context.Sensors.Add(sensor);
            await _context.SaveChangesAsync();

            var dataDto = new SensorDataDto
            {
                SensorId = 1,
                Temperature = 25.5,
                Humidity = 65.0,
                RawMoisture = 1500,
                RawRed = 100,
                RawGreen = 200,
                RawBlue = 300,
                RawWindRv = 2000,
                RawWindTmp = 1500
            };

            // Act
            await _sensorService.StoreSensorData(dataDto);

            // Assert
            var savedData = await _context.SensorData.FirstOrDefaultAsync(d => d.SensorsId == 1);
            Assert.IsNotNull(savedData);
            Assert.AreEqual(25.5, savedData.Temp);
            Assert.AreEqual(65, savedData.Humidity);
            Assert.AreEqual(1500, savedData.RawMoisture);
        }

        [TestMethod]
        public async Task StoreSensorData_ThrowsArgumentOutOfRangeException_WhenTemperatureOutOfBounds()
        {
            // Arrange
            var sensor = new Sensor
            {
                Id = 1,
                SensorName = "Test Sensor",
                Geo = new Point(10, 20) { SRID = 4326 }
            };
            _context.Sensors.Add(sensor);
            await _context.SaveChangesAsync();

            var dataDto = new SensorDataDto
            {
                SensorId = 1,
                Temperature = 60.0, // Limit is 50
                Humidity = 50.0,
                RawMoisture = 2000
            };

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentOutOfRangeException>(async () =>
            {
                await _sensorService.StoreSensorData(dataDto);
            });
        }

        [TestMethod]
        public async Task StoreSensorData_ThrowsArgumentOutOfRangeException_WhenHumidityOutOfBounds()
        {
            // Arrange
            var sensor = new Sensor
            {
                Id = 1,
                SensorName = "Test Sensor",
                Geo = new Point(10, 20) { SRID = 4326 }
            };
            _context.Sensors.Add(sensor);
            await _context.SaveChangesAsync();

            var dataDto = new SensorDataDto
            {
                SensorId = 1,
                Temperature = 25.0,
                Humidity = 105.0, // Limit is 100
                RawMoisture = 2000
            };

            // Act & Assert
            await Assert.ThrowsExceptionAsync<ArgumentOutOfRangeException>(async () =>
            {
                await _sensorService.StoreSensorData(dataDto);
            });
        }

        private class StubSensorDataRepository : ISensorDataRepository
        {
            public Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId, DateTime? from = null, DateTime? to = null, int? limit = null) => Task.FromResult<IEnumerable<SensorData>>(new List<SensorData>());
            public Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId) => Task.FromResult<IEnumerable<SensorData>>(new List<SensorData>());
            public async IAsyncEnumerable<SensorData> GetSensorsByTimeRangeAsync(DateTime dateTimeFrom, DateTime dateTimeTo) { yield break; }
            public Task<IEnumerable<SensorData>> GetDataSummary() => Task.FromResult<IEnumerable<SensorData>>(new List<SensorData>());
        }

        private class StubCheckpointService : ICheckpointService
        {
            public Task<IEnumerable<CheckpointDto>> GetAllAsync() => Task.FromResult<IEnumerable<CheckpointDto>>(new List<CheckpointDto>());
            public Task CreateForElementAsync(long elementId, Point location) => Task.CompletedTask;
            public Task CreateForSensorAsync(long sensorId, Point location) => Task.CompletedTask;
            public Task AssignZonesForNewZoneAsync(long zoneId, Geometry boundary) => Task.CompletedTask;
            public Task DeleteByReferenceAsync(string type, long referenceId) => Task.CompletedTask;
        }
    }
}
