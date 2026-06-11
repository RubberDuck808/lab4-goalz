using System.Net.Http.Headers;
using System.Text.Json;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Api.Services;

public class ImageAnalysisService : IImageAnalysisService
{
    private readonly HttpClient _http;
    private readonly ILogger<ImageAnalysisService> _logger;
    private readonly string _mlServiceUrl;

    // Separate client for GCP metadata server — bumped to 5 s; 2 s was too tight under load
    private static readonly HttpClient _metaClient = new() { Timeout = TimeSpan.FromSeconds(5) };

    // Serialises concurrent token fetches — prevents multiple simultaneous analyses from
    // each racing to fetch the token before the first one caches it, causing some requests
    // to go out without an auth header and receive 403 from Cloud Run.
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public ImageAnalysisService(HttpClient http, IConfiguration config, ILogger<ImageAnalysisService> logger)
    {
        _http         = http;
        _logger       = logger;
        _mlServiceUrl = config["MlService:BaseUrl"] ?? "http://localhost:8001";
        _http.BaseAddress = new Uri(_mlServiceUrl);
        _http.Timeout     = TimeSpan.FromSeconds(60);
    }

    /// <summary>
    /// Fetches a Google OIDC identity token from the Cloud Run metadata server.
    /// Returns null when running outside GCP (local dev) — callers skip auth in that case.
    /// Tokens are cached for 50 minutes (Cloud Run issues 1-hour tokens).
    /// </summary>
    private async Task<string?> GetIdentityTokenAsync(CancellationToken ct)
    {
        // Fast path: return cached token without acquiring the lock
        if (_cachedToken is not null && DateTime.UtcNow < _tokenExpiry)
            return _cachedToken;

        await _tokenLock.WaitAsync(ct);
        try
        {
            // Re-check inside the lock — another concurrent caller may have just fetched it
            if (_cachedToken is not null && DateTime.UtcNow < _tokenExpiry)
                return _cachedToken;

            var audience = _mlServiceUrl.TrimEnd('/');
            using var req = new HttpRequestMessage(HttpMethod.Get,
                $"http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience={audience}");
            req.Headers.Add("Metadata-Flavor", "Google");

            using var resp = await _metaClient.SendAsync(req, ct);
            if (!resp.IsSuccessStatusCode) return null;

            _cachedToken = (await resp.Content.ReadAsStringAsync(ct)).Trim();
            _tokenExpiry = DateTime.UtcNow.AddMinutes(50);
            return _cachedToken;
        }
        catch
        {
            return null; // not on GCP — local dev, skip auth
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    public async Task<ImageAnalysisResult?> AnalyseElementAsync(
        string imageUrl, string elementName, string elementType,
        CancellationToken ct = default)
    {
        try
        {
            var payload = JsonSerializer.Serialize(new { imageUrl, elementName, elementType });
            using var content = new StringContent(payload, System.Text.Encoding.UTF8, "application/json");
            using var request = new HttpRequestMessage(HttpMethod.Post, "/analyse") { Content = content };

            var token = await GetIdentityTokenAsync(ct);
            if (token is not null)
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            using var response = await _http.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            var confidence     = root.GetProperty("confidence").GetSingle();
            var summary        = root.GetProperty("summary").GetString() ?? "";
            var recommendation = root.GetProperty("recommendation").GetString() ?? "NeedsReview";

            if (!Enum.TryParse<AiRecommendation>(recommendation, out var rec))
                rec = AiRecommendation.NeedsReview;

            // classification is returned by the multi-class model.
            // Falls back gracefully to null if the field is absent (old binary model).
            string? classification = root.TryGetProperty("classification", out var classProp)
                ? classProp.GetString()
                : null;

            return new ImageAnalysisResult(confidence, summary, rec, classification);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "ML service call failed for image {ImageUrl}", imageUrl);
            return null;
        }
    }
}
