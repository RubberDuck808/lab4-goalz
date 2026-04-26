namespace Goalz.Domain.Entities;

public class Quiz
{
    public long Id { get; set; }
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<Party> Parties { get; set; } = [];
}
