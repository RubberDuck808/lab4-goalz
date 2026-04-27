using System.Text;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class GenerateReportService : IGenerateReportService
    {
        public void GenerateReport(GenerateReportDto settings)
        {
            StringBuilder csvFile = new StringBuilder();
            DateTime dateTimeFrom = settings.DateTimeFrom;
            DateTime dateTimeTo = settings.DateTimeTo;

            csvFile.Append(RenderReportContent(dateTimeFrom, dateTimeTo, settings.reportContents));
        }

        private StringBuilder RenderReportContent(DateTime dateTimeFrom, DateTime dateTimeTo, ReportSettingsDto settings)
        {
            StringBuilder stringBuilder = new StringBuilder();

            if (settings.SensorData)
            {
                var result = RenderSensorData(dateTimeFrom, dateTimeTo, settings.Temprature, settings.Light, settings.Humidity);

                stringBuilder.Append(result);
            }
        }

        private StringBuilder RenderSensorData(DateTime dateTimeFrom, DateTime dateTimeTo, bool temprature, bool light, bool humidity)
        {

        }
    }
}
