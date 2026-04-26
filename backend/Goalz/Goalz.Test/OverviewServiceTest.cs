using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
    public sealed class OverviewServiceTest
    {
        private OverviewService _overviewService = null!;
        private AppDbContext _context = null!; //nullable 

        

        [TestInitialize]
        public void setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            IOverviewRepository overviewRepository = new OverviewRepository(_context);

            _overviewService = new OverviewService(overviewRepository);

            ResetDatabase();
            SeedDatabase();
        }

        private void ResetDatabase()
        {
            _context.Sensors.RemoveRange(_context.Sensors);
            _context.Elements.RemoveRange(_context.Elements);

            _context.SaveChanges();
        }

        [TestCleanup]
        public void TearDown()
        {
            _context.Dispose();
        }

        private void SeedDatabase()
        {
            if (!_context.Sensors.Any())
            {
                _context.Sensors.AddRange(
                    new Sensor
                    {
                        Id = 1,
                        SensorName = "Sensor 1",
                        Geo = new Point(new Coordinate(10, -72)),
                        Light = 12,
                        Humidity = 14,
                        Temp = 17
                    },
                    new Sensor
                    {
                        Id = 2,
                        SensorName = "Sensor 2",
                        Geo = new Point(new Coordinate(11, -73)),
                        Light = 13,
                        Humidity = 15,
                        Temp = 18
                    },
                    new Sensor
                    {
                        Id = 3,
                        SensorName = "Sensor 3",
                        Geo = new Point(new Coordinate(12, -74)),
                        Light = 14,
                        Humidity = 16,
                        Temp = 19
                    }
                );
            }

            if (!_context.Elements.Any())
            {
                _context.Elements.AddRange(
                    new Element
                    {
                        Id = 1,
                        ElementName = "Element 1",
                        ElementTypeId = 1,
                        Geom = new Point(new Coordinate(10, -72)),
                        ImageUrl = "https://example.com/image1.jpg",
                        IsGreen = true,
                    },
                    new Element
                    {
                        Id = 2,
                        ElementName = "Element 2",
                        ElementTypeId = 1,
                        Geom = new Point(new Coordinate(11, -73)),
                        ImageUrl = "https://example.com/image2.jpg",
                        IsGreen = false,
                    },
                    new Element
                    {
                        Id = 3,
                        ElementName = "Element 3",
                        ElementTypeId = 1,
                        Geom = new Point(new Coordinate(12, -74)),
                        ImageUrl = "https://example.com/image3.jpg",
                        IsGreen = true,
                    },
                    new Element
                    {
                        Id = 4,
                        ElementName = "Element 4",
                        ElementTypeId = 1,
                        Geom = new Point(new Coordinate(13, -75)),
                        ImageUrl = "https://example.com/image4.jpg",
                        IsGreen = false,
                    }
                );

                _context.ElementTypes.Add(new ElementType
                {
                    Id = 1,
                    Name = "Tree"
                });
            }

            _context.SaveChanges();
        }

        [TestMethod]
        public async Task GetAllSensorsAsync_ReturnsAllSensors()
        {
            var result = await _overviewService.GetDashboardData();

            Assert.AreEqual(3, result.sensors.Count);

            Assert.IsTrue(result.sensors.Any(s => s.SensorName == "Sensor 1"));
            Assert.IsTrue(result.sensors.Any(s => s.SensorName == "Sensor 2"));
            Assert.IsTrue(result.sensors.Any(s => s.SensorName == "Sensor 3"));

            Assert.AreEqual(4, result.element.Count);

            Assert.IsTrue(result.element.Any(e => e.ElementName == "Element 1"));
            Assert.IsTrue(result.element.Any(e => e.ElementName == "Element 2"));
            Assert.IsTrue(result.element.Any(e => e.ElementName == "Element 3"));
            Assert.IsTrue(result.element.Any(e => e.ElementName == "Element 4"));
        }
    }
}
