namespace Goalz.Core.DTOs;

public class UserStatisticsDto
{
    public int  CheckpointsVisited { get; set; } = 0;
    public int  PicturesTaken      { get; set; } = 0;
    public int  PartiesJoined      { get; set; } = 0;
    public int  GamesPlayed        { get; set; } = 0;
    public long TotalPoints        { get; set; } = 0;
}
