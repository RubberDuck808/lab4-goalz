namespace Goalz.Domain.Entities;

public class Party
{
    public long Id { get; set; }
    public long QuizId { get; set; }
    public string Name { get; set; } = string.Empty;
    public long Code { get; set; }

    public Quiz Quiz { get; set; } = null!;
    public ICollection<PartyGroup> PartyGroups { get; set; } = [];
}
