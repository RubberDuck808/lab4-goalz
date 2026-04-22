namespace Goalz.Core.DTOs
{
    public class PartyRequest
    {
        public string Name { get; set; } = string.Empty; //C# Euivalent zu Gettern / Settern in Java
        public string Username { get; set; } = string.Empty;

    } 
}
//Ein DTO trägt die Daten (hier: Name, Username), die ein Controller entgegennimmt (Request),
//der Service verarbeitet die Daten in der Business-Logik und der Controller gibt das Ergebnis
//wieder zurück (Response).