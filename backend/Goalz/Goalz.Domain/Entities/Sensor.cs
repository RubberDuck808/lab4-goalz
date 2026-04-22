using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Sensor
{
    public long Id { get; set; }
    public long Temp { get; set; }
    public long Humidity { get; set; }

    public Nullable<long> Light { get; set; } = 0;
    //  public long InformationId { get; set; }
    public Point Geo { get; set; } 

   // public Information Information { get; set; } = null!;
}