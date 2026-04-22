using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Zone
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ZoneType { get; set; } = string.Empty;
    public string Color { get; set; } = "#33A661";
    public Geometry Boundary { get; set; } = null!;
}
