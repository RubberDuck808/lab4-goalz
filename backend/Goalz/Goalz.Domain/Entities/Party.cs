namespace Goalz.Domain.Entities;

public class Party
{
    public long Id { get; set; }
    public long? QuizId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Lobby";
    public long Code { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Game configuration set by host before starting
    public int? GroupSize { get; set; }          // null = no groups (Explorer role)
    public long? BoundaryId { get; set; }         // which boundary to play in
    public int? ZoneCount { get; set; }          // how many sub-zones to include
    public int? CheckpointsPerZone { get; set; } // max checkpoints per zone

    public Quiz? Quiz { get; set; }
    public ICollection<PartyGroup> PartyGroups { get; set; } = [];
}
