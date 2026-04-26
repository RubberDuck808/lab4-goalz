using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;
using NetTopologySuite.Geometries;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class OverviewServiceTests
    {
        private Mock<IOverviewRepository> _overviewRepoMock = null!;
        private OverviewService _sut = null!;

        private static Sensor MakeSensor(long id) => new()
        {
            Id = id,
            SensorName = $"Sensor-{id}",
            Geo = new Point(10.0 + id, 48.0) { SRID = 4326 }
        };

        private static Element MakeElement(long id) => new()
        {
            Id = id,
            ElementName = $"Element-{id}",
            Geom = new Point(10.0, 48.0 + id) { SRID = 4326 },
            IsGreen = true,
            ElementType = new ElementType { Id = 1, Name = "Tree" }
        };

        [TestInitialize]
        public void Setup()
        {
            _overviewRepoMock = new Mock<IOverviewRepository>();
            _sut = new OverviewService(_overviewRepoMock.Object);
        }

        // ── GetDashboardData ─────────────────────────────────────────────────────

        [TestMethod]
        public async Task GetDashboardData_WithSensorsAndElements_ReturnsPopulatedDto()
        {
            var sensors = new List<Sensor> { MakeSensor(1), MakeSensor(2) };
            var elements = new List<Element> { MakeElement(1), MakeElement(2), MakeElement(3) };
            _overviewRepoMock.Setup(r => r.GetAllSensorsAsync()).ReturnsAsync(sensors);
            _overviewRepoMock.Setup(r => r.GetAllElementsAsync()).ReturnsAsync(elements);

            var result = await _sut.GetDashboardData();

            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.sensors.Count);
            Assert.AreEqual(3, result.element.Count);
        }

        [TestMethod]
        public async Task GetDashboardData_EmptyRepository_ReturnsEmptyLists()
        {
            _overviewRepoMock.Setup(r => r.GetAllSensorsAsync()).ReturnsAsync(new List<Sensor>());
            _overviewRepoMock.Setup(r => r.GetAllElementsAsync()).ReturnsAsync(new List<Element>());

            var result = await _sut.GetDashboardData();

            Assert.IsNotNull(result);
            Assert.AreEqual(0, result.sensors.Count);
            Assert.AreEqual(0, result.element.Count);
        }

        [TestMethod]
        public async Task GetDashboardData_CallsSensorRepositoryOnce()
        {
            _overviewRepoMock.Setup(r => r.GetAllSensorsAsync()).ReturnsAsync(new List<Sensor>());
            _overviewRepoMock.Setup(r => r.GetAllElementsAsync()).ReturnsAsync(new List<Element>());

            await _sut.GetDashboardData();

            _overviewRepoMock.Verify(r => r.GetAllSensorsAsync(), Times.Once);
        }

        [TestMethod]
        public async Task GetDashboardData_CallsElementRepositoryOnce()
        {
            _overviewRepoMock.Setup(r => r.GetAllSensorsAsync()).ReturnsAsync(new List<Sensor>());
            _overviewRepoMock.Setup(r => r.GetAllElementsAsync()).ReturnsAsync(new List<Element>());

            await _sut.GetDashboardData();

            _overviewRepoMock.Verify(r => r.GetAllElementsAsync(), Times.Once);
        }

        [TestMethod]
        public async Task GetDashboardData_SensorDataIsPassedThrough()
        {
            var sensors = new List<Sensor> { MakeSensor(42) };
            _overviewRepoMock.Setup(r => r.GetAllSensorsAsync()).ReturnsAsync(sensors);
            _overviewRepoMock.Setup(r => r.GetAllElementsAsync()).ReturnsAsync(new List<Element>());

            var result = await _sut.GetDashboardData();

            Assert.AreSame(sensors, result.sensors);
        }

        [TestMethod]
        public async Task GetDashboardData_ElementDataIsPassedThrough()
        {
            var elements = new List<Element> { MakeElement(7) };
            _overviewRepoMock.Setup(r => r.GetAllSensorsAsync()).ReturnsAsync(new List<Sensor>());
            _overviewRepoMock.Setup(r => r.GetAllElementsAsync()).ReturnsAsync(elements);

            var result = await _sut.GetDashboardData();

            Assert.AreSame(elements, result.element);
        }
    }
}
