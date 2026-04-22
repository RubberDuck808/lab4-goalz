using System.Text.Json.Serialization;

namespace Goalz.Domain.Entities;

public class ElementType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Element> Elements { get; set; } = [];
}
