using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public record ImageAnalysisResult(
    float Confidence,
    string Summary,
    AiRecommendation Recommendation,
    string? Classification   // e.g. "tree", "shrub", "water_body" — null until multi-class model is deployed
);

public interface IImageAnalysisService
{
    Task<ImageAnalysisResult?> AnalyseElementAsync(
        string imageUrl, string elementName, string elementType,
        CancellationToken ct = default);
}
