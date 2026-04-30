˝
W/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Test/DatasetServiceTest.csåusing Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Data.Repositories;
using Goalz.Data.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Test
{
    [TestClass]
    public sealed class DatasetServiceTest
    {
        private DatasetService datasetService;
        private AppDbContext _context;

        [TestInitialize]
        public void setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
               .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
               .Options;

            _context = new AppDbContext(options);

            INatureElementRepository natureElementRepository = new NatureElementRepository(_context);
            datasetService = new DatasetService(natureElementRepository);
        }

        [TestMethod]
        [DataRow("\\TestFiles\\Goalz_dummy_set.csv", true)]
        public async Task ReadCSVFileTest_CorrectColumns(string filePath, bool expectedSuccess)
        {
            if (File.Exists(filePath))
            {
                using var stream = File.OpenRead(filePath);

                var file = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(filePath));

                var result = await datasetService.ReadCSV(file);

                if(result.Count == 0)
                {
                    Assert.Fail("The CSV file is empty.");
                }

                var expectedColumns = new List<string> { "Name", "Type", "Longitude", "Latitude", "IsGreen", "ImageUrl" };

                var missingColumns = result[0].Split(";").Where(c => !expectedColumns.Contains(c)).ToList();

                if (expectedSuccess)
                {
                    Assert.AreEqual(missingColumns.Count, 0);
                }
            }
        }

        [TestMethod]
        [DataRow(null)]
        public async Task ReadCSVFileTest_NullFile(IFormFile file)
        {
            await Assert.ThrowsExceptionAsync<ArgumentNullException>(async () => await datasetService.ReadCSV(file));
        }

        [TestMethod]
        [DataRow("C:\\Users\\Giel\\Desktop\\Goalz_dummy_set.csv", 10)]
        public async Task ReadCSVFileTest_CorrectRowCount(string filePath, int expectedRowCount)
        {
            if (File.Exists(filePath))
            {
                using var stream = File.OpenRead(filePath);
                var file = new FormFile(stream, 0, stream.Length, null, Path.GetFileName(filePath));

                var result = await datasetService.ReadCSV(file);

                Assert.AreEqual(result.Count, expectedRowCount);
            }
        }
    }
}
ParseOptions.0.json®
S/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Test/MSTestSettings.cs<[assembly: Parallelize(Scope = ExecutionScope.MethodLevel)]
ParseOptions.0.jsonÃ+
X/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Test/OverviewServiceTest.cs⁄*using System;
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
                    new Sensor { Id = 1, SensorName = "Sensor 1", Geo = new Point(new Coordinate(10, -72)) },
                    new Sensor { Id = 2, SensorName = "Sensor 2", Geo = new Point(new Coordinate(11, -73)) },
                    new Sensor { Id = 3, SensorName = "Sensor 3", Geo = new Point(new Coordinate(12, -74)) }
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

        [TestMethod]
        public async Task GetDashboardData_ReturnsCorrectGreenElementCount()
        {
            var result = await _overviewService.GetDashboardData();

            var greenElements = result.element.Where(e => e.IsGreen).ToList();

            Assert.AreEqual(2, greenElements.Count);
        }

        [TestMethod]
        public async Task GetDashboardData_AllSensorsHaveName()
        {
            var result = await _overviewService.GetDashboardData();

            Assert.IsTrue(result.sensors.All(s => !string.IsNullOrEmpty(s.SensorName)));
        }

        [TestMethod]
        public async Task GetDashboardData_AllElementsHaveName()
        {
            var result = await _overviewService.GetDashboardData();

            Assert.IsTrue(result.element.All(e => !string.IsNullOrEmpty(e.ElementName)));
        }
    }
}
ParseOptions.0.jsonË
w/Users/carmensimon/.nuget/packages/microsoft.net.test.sdk/17.12.0/build/netcoreapp3.1/Microsoft.NET.Test.Sdk.Program.cs◊// <auto-generated> This file has been auto generated. </auto-generated>
using System;
[Microsoft.VisualStudio.TestPlatform.TestSDKAutoGeneratedCode]
class AutoGeneratedProgram {static void Main(string[] args){}}ParseOptions.0.json´
o/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Test/obj/Debug/net9.0/Goalz.Test.GlobalUsings.g.cs¢// <auto-generated/>
global using Microsoft.VisualStudio.TestTools.UnitTesting;
global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Net.Http;
global using System.Threading;
global using System.Threading.Tasks;
ParseOptions.0.jsonﬁ
Å/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Test/obj/Debug/net9.0/.NETCoreApp,Version=v9.0.AssemblyAttributes.cs¬// <autogenerated />
using System;
using System.Reflection;
[assembly: global::System.Runtime.Versioning.TargetFrameworkAttribute(".NETCoreApp,Version=v9.0", FrameworkDisplayName = ".NET 9.0")]
ParseOptions.0.json›
m/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Test/obj/Debug/net9.0/Goalz.Test.AssemblyInfo.cs÷//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: System.Reflection.AssemblyCompanyAttribute("Goalz.Test")]
[assembly: System.Reflection.AssemblyConfigurationAttribute("Debug")]
[assembly: System.Reflection.AssemblyFileVersionAttribute("1.0.0.0")]
[assembly: System.Reflection.AssemblyInformationalVersionAttribute("1.0.0+386b1377d4b3d9193b1660fe8debbcb244aea640")]
[assembly: System.Reflection.AssemblyProductAttribute("Goalz.Test")]
[assembly: System.Reflection.AssemblyTitleAttribute("Goalz.Test")]
[assembly: System.Reflection.AssemblyVersionAttribute("1.0.0.0")]

// Generated by the MSBuild WriteCodeFragment class.

ParseOptions.0.json