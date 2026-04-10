namespace Goalz.Domain.Entities;

public class Question
{
    public long Id { get; set; }
    public long QuizId { get; set; }
    public string QuestionTxt { get; set; } = string.Empty;

    public Quiz Quiz { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = [];
}
