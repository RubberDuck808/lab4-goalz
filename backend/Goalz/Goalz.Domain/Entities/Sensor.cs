using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Sensor
{
    public long Id { get; set; }
    public string? SensorName { get; set; }
    public long Temp { get; set; }
    public long Humidity { get; set; }
    public long? Light { get; set; }
    public Point Geo { get; set; } = null!;
}
