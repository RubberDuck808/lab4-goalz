using Goalz.Domain.Entities;

namespace Goalz.API.Models
{
    public class MapElements
    {
        public List<Sensor> sensors { get; set; } = new List<Sensor>();
        public List<Element> element { get; set; } = new List<Element>();
    }
}
