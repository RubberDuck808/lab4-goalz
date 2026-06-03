using System.Text.Json;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Api.Services;

public class ImageAnalysisService : IImageAnalysisService
{
    private readonly HttpClient _http;
    private readonly ILogger<ImageAnalysisService> _logger;

    public ImageAnalysisService(HttpClient http, IConfiguration config, ILogger<ImageAnalysisService> logger)
    {
        _http   = http;
        _logger = logger;
        var baseUrl = config["MlService:BaseUrl"] ?? "http://localhost:8001";
        _http.BaseAddress = new Uri(baseUrl);
        _http.Timeout     = TimeSpan.FromSeconds(60);
    }

    public async Task<ImageAnalysisResult?> AnalyseElementAsync(
        string imageUrl, string elementName, string elementType,
        CancellationToken ct = default)
    {
        try
        {
            var payload = JsonSerializer.Serialize(new
            {
                imageUrl,
                elementName,
                elementType
            });
            using var content = new StringContent(payload, System.Text.Encoding.UTF8, "application/json");
            using var response = await _http.PostAsync("/analyse", content, ct);
            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            var confidence     = root.GetProperty("confidence").GetSingle();
            var summary        = root.GetProperty("summary").GetString() ?? "";
            var recommendation = root.GetProperty("recommendation").GetString() ?? "NeedsReview";

            if (!Enum.TryParse<AiRecommendation>(recommendation, out var rec))
                rec = AiRecommendation.NeedsReview;

            return new ImageAnalysisResult(confidence, summary, rec);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ML service call failed for image {ImageUrl}", imageUrl);
            return null;
        }
    }
}
