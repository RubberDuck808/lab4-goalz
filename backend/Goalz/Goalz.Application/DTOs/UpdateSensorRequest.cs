namespace Goalz.Core.DTOs;

public class UpdateSensorRequest
{
    public string SensorName { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
}
