using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class ZoneDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public long? BoundaryId { get; set; }
        public Geometry Boundary { get; set; } = null!;
    }
}
