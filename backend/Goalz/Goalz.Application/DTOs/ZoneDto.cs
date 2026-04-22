using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class ZoneDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ZoneType { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public Geometry Boundary { get; set; } = null!;
    }

    public class CreateZoneDto
    {
        public string Name { get; set; } = string.Empty;
        public string ZoneType { get; set; } = string.Empty;
        public string Color { get; set; } = "#33A661";
        public Geometry Boundary { get; set; } = null!;
    }

    public class UpdateZoneDto
    {
        public string Name { get; set; } = string.Empty;
        public string ZoneType { get; set; } = string.Empty;
        public string Color { get; set; } = "#33A661";
        public Geometry? Boundary { get; set; }
    }
}
