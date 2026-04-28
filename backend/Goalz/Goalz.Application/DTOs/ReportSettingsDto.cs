namespace Goalz.Core.DTOs
{
    public class ReportSettingsDto
    {
        public bool Trees { get; set; }
        public bool Bushes { get; set; }
        public bool Water { get; set; }
        public bool Species { get; set; }
        public bool SensorData { get; set; }
        public bool Temperature { get; set; }
        public bool Light { get; set; }
        public bool Humidity { get; set; }
        public bool GreenVsNonGreen { get; set; }
        public bool NativeVsNonNative { get; set; }
        public bool Biodiversity { get; set; }
        public bool NetZeroGoal { get; set; }
        public bool LineCharts { get; set; }
        public bool BarCharts { get; set; }
        public bool PieCharts { get; set; }
        public bool AlboretumMap { get; set; }
    }
}
