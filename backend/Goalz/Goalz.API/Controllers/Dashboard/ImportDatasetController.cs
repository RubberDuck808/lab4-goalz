using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Http;
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
                var results = new List<DatasetPreview>();

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
    }
}
