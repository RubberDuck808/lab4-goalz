namespace Goalz.API.Entities;

public class Answer
{
    public long Id { get; set; }
    public long QuestionId { get; set; }
    public string AnswerTxt { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }

    public Question Question { get; set; } = null!;
    public ICollection<PartyGroupAnswer> PartyGroupAnswers { get; set; } = [];
}
