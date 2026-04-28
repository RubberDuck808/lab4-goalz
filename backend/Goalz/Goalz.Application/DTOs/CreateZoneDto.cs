using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class CreateZoneDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#33A661";
        public long? BoundaryId { get; set; }
        public Geometry Boundary { get; set; } = null!;
    }
}
