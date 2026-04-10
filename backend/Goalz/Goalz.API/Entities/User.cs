namespace Goalz.API.Entities;

public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Player;

    public ICollection<PartyMember> PartyMembers { get; set; } = [];
}
