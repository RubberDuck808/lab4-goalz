namespace Goalz.API.Models
{
    public class SensorData
    {
        public int SensorId { get; set; }
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double Light { get; set; }
        public double SoilMoisture { get; set; }
        public double RawMoisture { get; set; }
    }
}
