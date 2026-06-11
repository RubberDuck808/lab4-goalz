namespace Goalz.Core.DTOs;

public class CheckpointDto
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;   // "sensor" | "element"
    public long ReferenceId { get; set; }
    public long? ZoneId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public long? ElementTypeId { get; set; }  // null for sensors
    public bool? IsGreen { get; set; }        // null for sensors
    public string Name { get; set; } = string.Empty;
}
