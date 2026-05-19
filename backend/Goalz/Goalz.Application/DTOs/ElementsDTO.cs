using Goalz.Domain.Entities;

namespace Goalz.Core.DTOs
{
    public class ElementsDTO
    {
        public List<SensorOverviewDto> sensors { get; set; } = new();
        public List<Element> element { get; set; } = new List<Element>();
    }
}
