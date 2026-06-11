using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class UpdateBoundaryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#1A5C2E";
        public Geometry? Boundary { get; set; }
    }
}
