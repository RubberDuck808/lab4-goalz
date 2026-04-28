namespace Goalz.Core.DTOs
{
    public class PartyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int? GroupSize { get; set; }
        public long? BoundaryId { get; set; }
        public int? ZoneCount { get; set; }
        public int? CheckpointsPerZone { get; set; }
    }
}
//Ein DTO trägt die Daten (hier: Name, Username), die ein Controller entgegennimmt (Request),
//der Service verarbeitet die Daten in der Business-Logik und der Controller gibt das Ergebnis
//wieder zurück (Response).