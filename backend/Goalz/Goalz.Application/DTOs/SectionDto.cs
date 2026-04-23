using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class SectionSummaryDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsLocked { get; set; }
        public Geometry Boundary { get; set; } = null!;
    }

    public class SectionDetailDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string CompletionCriteria { get; set; } = string.Empty;
        public bool IsLocked { get; set; }
        public Geometry Boundary { get; set; } = null!;
        public IEnumerable<CheckpointDto> Checkpoints { get; set; } = [];
    }

    public class CheckpointDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}
