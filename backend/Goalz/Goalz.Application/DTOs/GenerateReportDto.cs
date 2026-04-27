namespace Goalz.Core.DTOs
{
    public class GenerateReportDto
    {
        public DateTime DateTimeFrom { get; set; }
        public DateTime DateTimeTo { get; set; }
        public ReportSettingsDto reportContents { get; set; } = new ReportSettingsDto();
        public ReportTypeEnum ReportType { get; set; }
    }
}
