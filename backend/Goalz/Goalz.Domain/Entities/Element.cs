using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Element
{
    public long Id { get; set; }
    public long ElementName { get; set; }
    public int ElementTypeId { get; set; }
    public ElementType ElementType { get; set; } = null!;
    public Point Geom { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
}