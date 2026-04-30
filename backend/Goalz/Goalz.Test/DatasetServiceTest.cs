using Goalz.Core.Interfaces;
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
        [DataRow("\\TestFiles\\Goalz_dummy_set.csv", 10)]
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
