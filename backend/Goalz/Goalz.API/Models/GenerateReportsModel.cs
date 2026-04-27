using Goalz.Core.DTOs;

namespace Goalz.API.Models
{
    public class GenerateReportsModel
    {
        public DateTime DateTimeFrom { get; set; }
        public DateTime DateTimeTo { get; set; }
        public ReportSettingsDto reportContents { get; set; } = new ReportSettingsDto();
        public ReportTypeEnum ReportType { get; set; }
    }
}
