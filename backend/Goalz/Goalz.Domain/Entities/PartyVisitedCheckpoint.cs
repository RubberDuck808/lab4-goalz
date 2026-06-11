namespace Goalz.Domain.Entities;

public class PartyVisitedCheckpoint
{
    public long Id { get; set; }
    public long PartyId { get; set; }
    public Party Party { get; set; } = null!;
    public long CheckpointId { get; set; }
    public Checkpoint Checkpoint { get; set; } = null!;
}
