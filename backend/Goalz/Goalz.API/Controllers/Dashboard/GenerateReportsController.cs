using Goalz.API.Models;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenerateReportsController : ControllerBase
    {
        private IGenerateReportService _generateReportService;

        public GenerateReportsController(IGenerateReportService generateReportService) 
        { 
            _generateReportService = generateReportService;
        }

        [HttpGet]
        public IActionResult GenerateReport(GenerateReportsModel model)
        {
            GenerateReportDto settingsDto = new GenerateReportDto();
            settingsDto.DateTimeTo = model.DateTimeTo;
            settingsDto.DateTimeFrom = model.DateTimeFrom;
            settingsDto.ReportType = model.ReportType;
            settingsDto.reportContents = model.reportContents;

            _generateReportService.GenerateReport(settingsDto);

            return Ok();
        }
    }
}
