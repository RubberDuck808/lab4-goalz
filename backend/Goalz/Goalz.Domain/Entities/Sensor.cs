using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Sensor
{
    public long Id { get; set; }
    public string? SensorName { get; set; }
    public Point? Geo { get; set; }
    public long? PopUpId { get; set; }
    public PopUp? PopUp { get; set; }
    public ICollection<SensorData> SensorData { get; set; } = new List<SensorData>();
}
