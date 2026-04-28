using System.Text;
using Goalz.API.Models;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard
{
    [Route("api/dashboard")]
    [ApiController]
    public class GenerateReportsController : ControllerBase
    {
        private IGenerateReportService _generateReportService;

        public GenerateReportsController(IGenerateReportService generateReportService) 
        { 
            _generateReportService = generateReportService;
        }

        [HttpPost("generate")]
        public IActionResult GenerateReport(GenerateReportsModel model)
        {
            try
            {
                GenerateReportDto settingsDto = new GenerateReportDto();
                settingsDto.DateTimeTo = model.DateTimeTo;
                settingsDto.DateTimeFrom = model.DateTimeFrom;
                settingsDto.ReportType = model.ReportType;
                settingsDto.reportContents = model.reportContents;

                var stringBuilder = _generateReportService.GenerateReport(settingsDto);

                var bytes = Encoding.UTF8.GetBytes(stringBuilder.ToString());

                if (model.ReportType == ReportTypeEnum.CSV)
                {
                    return File(
                        bytes,
                        "text/csv",
                        "landscape-elements.csv"
                    );
                }

                return BadRequest("File type not supported!");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}
