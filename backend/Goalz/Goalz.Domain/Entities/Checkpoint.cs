using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Checkpoint
{
    public long Id { get; set; }
    public long SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Point Location { get; set; } = null!;
}
