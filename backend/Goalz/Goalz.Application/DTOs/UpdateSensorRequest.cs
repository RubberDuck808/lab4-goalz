using System.ComponentModel.DataAnnotations;

namespace Goalz.Core.DTOs;

public class UpdateSensorRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string SensorName { get; set; } = string.Empty;

    [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180.")]
    public double Longitude { get; set; }

    [Range(-90.0, 90.0, ErrorMessage = "Latitude must be between -90 and 90.")]
    public double Latitude { get; set; }
}
