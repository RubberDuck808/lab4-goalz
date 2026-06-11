using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Boundary
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#1A5C2E";
    public Geometry Geometry { get; set; } = null!;
}
