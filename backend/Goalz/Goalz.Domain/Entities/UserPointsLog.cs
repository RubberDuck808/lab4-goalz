namespace Goalz.Domain.Entities
{
    public class UserPointsLog
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long PointsEarned { get; set; }
        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
    }
}
