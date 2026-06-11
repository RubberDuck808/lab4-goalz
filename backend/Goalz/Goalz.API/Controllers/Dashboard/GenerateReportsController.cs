using System.Text;
using Goalz.API.Models;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace Goalz.API.Controllers.Dashboard
{
    [Authorize]
    [Route("api/dashboard")]
    [ApiController]
    public class GenerateReportsController : ControllerBase
    {
        private readonly IGenerateReportService _generateReportService;
        private readonly ILogger<GenerateReportsController> _logger;

        public GenerateReportsController(IGenerateReportService generateReportService, ILogger<GenerateReportsController> logger) 
        { 
            _generateReportService = generateReportService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateReport(GenerateReportsModel model)
        {
            try
            {
                GenerateReportDto settingsDto = new GenerateReportDto();
                settingsDto.DateTimeTo = model.DateTimeTo;
                settingsDto.DateTimeFrom = model.DateTimeFrom;
                settingsDto.ReportType = model.ReportType;
                settingsDto.reportContents = model.reportContents;

                if (model.ReportType != ReportTypeEnum.CSV)
                {
                    return BadRequest("File type not supported!");
                }

                Response.ContentType = "text/csv";
                Response.Headers.Append("Content-Disposition", "attachment; filename=landscape-elements.csv");

                await using (var writer = new StreamWriter(Response.Body, Encoding.UTF8))
                {
                    await foreach (var line in _generateReportService.StreamReportAsync(settingsDto))
                    {
                        await writer.WriteLineAsync(line);
                    }
                }

                return new EmptyResult();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report.");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}
