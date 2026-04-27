namespace Goalz.Domain.Entities;

public class SensorData
{
    public long Id { get; set; }
    public long SensorsId { get; set; }
    public long Light { get; set; }
    public long Humidity { get; set; }
    public double Temp { get; set; }
    public DateTime Timestamp { get; set; }

    public Sensor Sensor { get; set; } = null!;
}
