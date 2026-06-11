using System.ComponentModel.DataAnnotations;

namespace Goalz.Core.DTOs;

public class CreateElementRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string ElementName { get; set; } = string.Empty;

    [Required]
    public string ElementType { get; set; } = string.Empty;

    [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180.")]
    public double Longitude { get; set; }

    [Range(-90.0, 90.0, ErrorMessage = "Latitude must be between -90 and 90.")]
    public double Latitude { get; set; }

    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
    public bool IsApproved { get; set; } = true;  // game controller forces false; dashboard forces true
    public string? SubmittedBy { get; set; }
}
