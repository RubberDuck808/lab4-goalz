namespace Goalz.Core.DTOs;

public class PendingElementDto
{
    public long Id { get; set; }
    public string ElementName { get; set; } = string.Empty;
    public string ElementType { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
    public string? SubmittedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
