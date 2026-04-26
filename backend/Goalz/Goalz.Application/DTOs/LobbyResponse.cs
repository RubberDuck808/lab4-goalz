namespace Goalz.Core.DTOs
{
    public class LobbyResponse
    {
        public long PartyId { get; set; }
        public string PartyName { get; set; } = string.Empty;
        public List<string> Members { get; set; } = [];
        public long Code { get; set; }
        public bool IsReady { get; set; }
    }
}
