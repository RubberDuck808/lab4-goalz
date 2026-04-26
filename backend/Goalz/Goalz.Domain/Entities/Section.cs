namespace Goalz.Domain.Entities;

public class Section
{
    public long Id { get; set; }
    public long ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;
    public int OrderIndex { get; set; }
    public string CompletionCriteria { get; set; } = "visit_all_checkpoints";
}
