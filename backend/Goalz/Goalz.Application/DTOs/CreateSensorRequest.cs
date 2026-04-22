namespace Goalz.Core.DTOs;

public class CreateSensorRequest
{
    public string SensorName { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
}
