using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Checkpoint
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;  // "sensor" | "element"
    public long ReferenceId { get; set; }
    public Point Location { get; set; } = null!;
    public long? ZoneId { get; set; }
    public Zone? Zone { get; set; }
}
