namespace Goalz.API.Entities;

public class PartyGroup
{
    public long Id { get; set; }
    public long PartyId { get; set; }
    public string Name { get; set; } = string.Empty;

    public Party Party { get; set; } = null!;
    public ICollection<PartyMember> PartyMembers { get; set; } = [];
    public ICollection<PartyGroupAnswer> PartyGroupAnswers { get; set; } = [];
}
