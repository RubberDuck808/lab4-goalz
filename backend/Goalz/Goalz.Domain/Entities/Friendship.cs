namespace Goalz.Domain.Entities;

public class Friendship
{
    public long Id { get; set; }

    public long RequesterId { get; set; }
    public User Requester { get; set; } = null!;

    public long AddresseeId { get; set; }
    public User Addressee { get; set; } = null!;

    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
