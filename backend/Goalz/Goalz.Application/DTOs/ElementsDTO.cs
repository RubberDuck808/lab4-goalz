using Goalz.Domain.Entities;

namespace Goalz.Core.DTOs
{
    public class ElementsDTO
    {
        public List<Sensor> sensors { get; set; } = new List<Sensor>();
        public List<Element> element { get; set; } = new List<Element>();
    }
}
