using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class BoundaryDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public Geometry Boundary { get; set; } = null!;  // named Boundary to match ZoneDto.Boundary in frontend
    }
}
