using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard
{
    [Route("api/dashboard/[controller]")]
    [ApiController]
    public class ImportDatasetController : ControllerBase
    {
        private readonly IDatasetService _datasetService;

        public ImportDatasetController(IDatasetService datasetService)
        {
            _datasetService = datasetService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadDataset([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                var results = new List<List<string>>();

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        var result = await _datasetService.ReadCSV(file);
                        results.Add(result);
                    }
                }

                return Ok(results);
            }
            catch (Exception)
            {

                throw;
            }
        }

        [HttpPost("store")]
        public async Task<IActionResult> StoreDataset(List<string> records)
        {
            try
            {
                await _datasetService.StoreCSVFile(records);

                return Ok("Elements successfully stored!");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest($"Invalid dataset format: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while storing the dataset: {ex.Message}");
            }
           
        }
    }
}
