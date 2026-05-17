namespace Goalz.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Player;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int AvatarId { get; set; } = 1;

    public ICollection<PartyMember> PartyMembers { get; set; } = [];
    public ICollection<Friendship> SentFriendships { get; set; } = [];
    public ICollection<Friendship> ReceivedFriendships { get; set; } = [];
    public UserStatistics? Statistics { get; set; }
}
