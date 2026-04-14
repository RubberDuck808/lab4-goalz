namespace Goalz.Domain.Entities;

public class PartyGroupAnswer
{
    public long Id { get; set; }
    public long PartyGroupId { get; set; }
    public long AnswerId { get; set; }
    public long ReceivedPoints { get; set; }

    public PartyGroup PartyGroup { get; set; } = null!;
    public Answer Answer { get; set; } = null!;
}
