namespace Goalz.Core.DTOs
{
    public class SensorDataDto
    {
        public int SensorId { get; set; }

        public double Temperature { get; set; }
        public double Humidity { get; set; }

        public int RawMoisture { get; set; }

        public uint RawRed { get; set; }
        public uint RawGreen { get; set; }
        public uint RawBlue { get; set; }
        public uint RawIR { get; set; }

        public int RawWindRv { get; set; }
        public int RawWindTmp { get; set; }

        public long? Light { get; set; }
    }
    
}
