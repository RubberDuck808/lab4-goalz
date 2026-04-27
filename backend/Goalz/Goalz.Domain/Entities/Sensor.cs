using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Sensor
{
    public long Id { get; set; }
    public string? SensorName { get; set; }
    public Point? Geo { get; set; }
}
