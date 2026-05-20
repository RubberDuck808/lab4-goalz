using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using System;
using System.Collections.Generic;

namespace Goalz.Core.Services
{
    public class GenerateReportService : IGenerateReportService
    {
        private readonly ISensorDataRepository _sensorDataRepository;
        public GenerateReportService(ISensorDataRepository sensorDataRepository) 
        { 
            _sensorDataRepository = sensorDataRepository;
        }

        public async IAsyncEnumerable<string> StreamReportAsync(GenerateReportDto settings)
        {
            ValidateSettings(settings);

            var dateTimeFrom = DateTime.SpecifyKind(settings.DateTimeFrom, DateTimeKind.Utc);
            var dateTimeTo = DateTime.SpecifyKind(settings.DateTimeTo, DateTimeKind.Utc);

            if (settings.reportContents != null && settings.reportContents.SensorData && 
                (settings.reportContents.Temperature || settings.reportContents.Humidity || settings.reportContents.Light))
            {
                yield return "Sensor Id;Temprature;Humidity;Light;Timestamp";

                var sensorsData = _sensorDataRepository.GetSensorsByTimeRangeAsync(dateTimeFrom, dateTimeTo);

                await foreach (var data in sensorsData)
                {
                    var tempVal = settings.reportContents.Temperature ? data.Temp.ToString() : "";
                    var humVal = settings.reportContents.Humidity ? data.Humidity.ToString() : "";
                    var lightVal = settings.reportContents.Light ? data.Light.ToString() : "";
                    var timestampVal = data.Timestamp.ToString("HH:mm:ss dd-MM-yyyy");

                    yield return $"{data.SensorsId};{tempVal};{humVal};{lightVal};{timestampVal}";
                }
            }
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
    }
}
