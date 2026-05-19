namespace Goalz.Api.Controllers.Game;

public class CompleteGameRequest
{
    public List<long> CheckpointIds { get; set; } = [];
    public int QuizScore { get; set; } = 0;
}
