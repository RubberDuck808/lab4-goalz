using System.Text;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using System.IO;

namespace Goalz.Core.Services
{
    public class GenerateReportService : IGenerateReportService
    {
        private ISensorDataRepository _sensorDataRepository;
        public GenerateReportService(ISensorDataRepository sensorDataRepository) 
        { 
            _sensorDataRepository = sensorDataRepository;
        }

        public StringBuilder GenerateReport(GenerateReportDto settings)
        {
            StringBuilder csvFile = new StringBuilder();

            ValidateSettings(settings);

            var dateTimeFrom = DateTime.SpecifyKind(settings.DateTimeFrom, DateTimeKind.Utc);
            var dateTimeTo = DateTime.SpecifyKind(settings.DateTimeTo, DateTimeKind.Utc);

            csvFile.Append(RenderReportContent(dateTimeFrom, dateTimeTo, settings.reportContents));

            return csvFile;
        }

        private void ValidateSettings(GenerateReportDto settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings), "Settings cannot be null.");
            }

            if (settings.reportContents == null)
            {
                throw new ArgumentException("Report contents must contain at least one value.");
            }

            if (settings.DateTimeFrom > settings.DateTimeTo)
            {
                throw new ArgumentException("DateTimeFrom cannot be later than DateTimeTo.");
            }

            if (settings.ReportType == 0)
            {
                throw new ArgumentException("ReportType must be a valid value.");
            }
        }

        private StringBuilder RenderReportContent(DateTime dateTimeFrom, DateTime dateTimeTo, ReportSettingsDto settings)
        {
            StringBuilder stringBuilder = new StringBuilder();

            if (settings.SensorData && (settings.Temperature || settings.Humidity || settings.Light))
            {
                var result = RenderSensorData(dateTimeFrom, dateTimeTo, settings.Temperature, settings.Light, settings.Humidity);

                stringBuilder.Append(result);
            }

            return stringBuilder;
        }

        private StringBuilder RenderNatureElement(DateTime dateTimeFrom, DateTime dateTimeTo, ReportSettingsDto settings)
        {
            StringBuilder stringBuilder = new StringBuilder();



            return stringBuilder;
        }

        private StringBuilder RenderSensorData(DateTime dateTimeFrom, DateTime dateTimeTo, bool temprature, bool light, bool humidity)
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.AppendLine("Sensor Id;Temprature;Humidity;Light;Timestamp");

            var sensorsData = _sensorDataRepository.GetSensorsByTimeRangeAsync(dateTimeFrom, dateTimeTo).Result;

            foreach (var data in sensorsData)
            {
                stringBuilder.Append(data.SensorsId);
                stringBuilder.Append(";");

                stringBuilder.Append(temprature ? data.Temp.ToString() : "");
                stringBuilder.Append(";");

                stringBuilder.Append(humidity ? data.Humidity.ToString() : "");
                stringBuilder.Append(";");

                stringBuilder.Append(light ? data.Light.ToString() : "");
                stringBuilder.Append(";");

                stringBuilder.Append(data.Timestamp.ToString("HH:mm:ss dd-MM-yyyy"));

                stringBuilder.AppendLine();
            }

            return stringBuilder;
        }
    }
}
