using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs;

public class SensorOverviewDto
{
    public long Id { get; set; }
    public string? SensorName { get; set; }
    public Point? Geo { get; set; }
    public long? PopUpId { get; set; }
    public double? Temp { get; set; }
    public double? Humidity { get; set; }
    public double? Light { get; set; }
    public long? SoilMoisture { get; set; }
    public DateTime? LastReading { get; set; }
}
