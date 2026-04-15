namespace Goalz.Domain.Entities;

public class Information
{
    public long Id { get; set; }
    public long InfoTxt { get; set; }
    public long NewColumn { get; set; }

    public ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
}