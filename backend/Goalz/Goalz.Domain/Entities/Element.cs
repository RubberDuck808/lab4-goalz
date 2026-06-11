using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Element
{
    public long Id { get; set; }
    public string ElementName { get; set; } = string.Empty;
    public int ElementTypeId { get; set; }
    public ElementType ElementType { get; set; } = null!;
    public Point Geom { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
    public bool IsApproved { get; set; }
    public bool IsRejected { get; set; }
    public string? SubmittedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public float? AiConfidence { get; set; }
    public string? AiSummary { get; set; }
    public AiRecommendation? AiResult { get; set; }
    public string? AiClassification { get; set; }
    public DateTime? AnalysedAt { get; set; }
}