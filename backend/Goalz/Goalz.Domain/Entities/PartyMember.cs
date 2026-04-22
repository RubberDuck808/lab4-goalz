namespace Goalz.Domain.Entities;

public class PartyMember
{
    public long Id { get; set; }
    public long PartyGroupId { get; set; }
    public long UserId { get; set; }

    public PartyGroup PartyGroup { get; set; } = null!;
    public User User { get; set; } = null!;
    public long PartyId { get; set; }
}
