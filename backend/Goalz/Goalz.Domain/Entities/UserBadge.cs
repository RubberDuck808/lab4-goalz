namespace Goalz.Domain.Entities
{
    public class UserBadge
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string BadgeId { get; set; } = string.Empty;
        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
    }
}
