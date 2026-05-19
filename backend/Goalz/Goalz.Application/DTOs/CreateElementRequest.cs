namespace Goalz.Core.DTOs;

public class CreateElementRequest
{
    public string ElementName { get; set; } = string.Empty;
    public string ElementType { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
    public bool IsApproved { get; set; } = true;  // game controller forces false; dashboard forces true
    public string? SubmittedBy { get; set; }
}
