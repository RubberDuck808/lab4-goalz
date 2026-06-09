using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System.IO;

namespace Goalz.API.Controllers.Dashboard
{
    [Authorize]
    [Route("api/dashboard/[controller]")]
    [ApiController]
    public class ImportDatasetController : ControllerBase
    {
        private readonly IDatasetService _datasetService;
        private readonly ILogger<ImportDatasetController> _logger;

        public ImportDatasetController(IDatasetService datasetService, ILogger<ImportDatasetController> logger)
        {
            _datasetService = datasetService;
            _logger = logger;
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
                        // Validate file size limit: 5 MB
                        if (file.Length > 5 * 1024 * 1024)
                        {
                            return BadRequest("File size exceeds 5MB limit.");
                        }

                        // Validate file extension: must be .csv
                        var extension = Path.GetExtension(file.FileName);
                        if (!string.Equals(extension, ".csv", StringComparison.OrdinalIgnoreCase))
                        {
                            return BadRequest("Only CSV files are allowed.");
                        }

                        var result = await _datasetService.ReadCSV(file);
                        results.Add(result);
                    }
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading dataset file.");
                return StatusCode(500, "An error occurred while uploading the dataset.");
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
                _logger.LogError(ex, "Error storing dataset records.");
                return StatusCode(500, "An error occurred while storing the dataset.");
            }
        }
    }
}
