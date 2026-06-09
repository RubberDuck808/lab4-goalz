namespace Goalz.Core.DTOs
{
    public class SensorDataSummaryDto
    {
        public long id { get; set; }
        public long sensorId { get; set; }
        public long light { get; set; }
        public long humidity { get; set; }
        public double temperature { get; set; }
        public DateTime timestamp { get; set; }
        public int? soilMoisture { get; set; }
        public double? wind { get; set; }
    }
}
