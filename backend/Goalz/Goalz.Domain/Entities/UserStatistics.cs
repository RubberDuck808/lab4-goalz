namespace Goalz.Domain.Entities;

public class UserStatistics
{
    public long Id { get; set; }
    public long UserId { get; set; }

    public int CheckpointsVisited { get; set; } = 0;
    public int PicturesTaken    { get; set; } = 0;
    public int PartiesJoined    { get; set; } = 0;
    public int GamesPlayed      { get; set; } = 0;
    public long TotalPoints     { get; set; } = 0;

    public User User { get; set; } = null!;
}
