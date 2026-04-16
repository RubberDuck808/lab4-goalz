using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Element
{
    public long Id { get; set; }
    public long ElementName { get; set; }
    public long ElementType { get; set; }
    public Point Geom { get; set; } 
    public string ImageUrl { get; set; } = null!;
    public bool IsGreen { get; set; }
}