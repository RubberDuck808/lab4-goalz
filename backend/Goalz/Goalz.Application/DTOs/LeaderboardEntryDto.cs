namespace Goalz.Core.DTOs
{
    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string Username { get; set; } = string.Empty;
        public long TotalPoints { get; set; }
        public int AvatarId { get; set; } = 1;
    }
}
