using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public record ImageAnalysisResult(float Confidence, string Summary, AiRecommendation Recommendation);

public interface IImageAnalysisService
{
    Task<ImageAnalysisResult?> AnalyseElementAsync(
        string imageUrl, string elementName, string elementType,
        CancellationToken ct = default);
}
