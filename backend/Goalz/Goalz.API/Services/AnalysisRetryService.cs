using Goalz.Core.Interfaces;

namespace Goalz.Api.Services;

public class AnalysisRetryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AnalysisRetryService> _logger;

    public AnalysisRetryService(IServiceScopeFactory scopeFactory, ILogger<AnalysisRetryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger       = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var elementService = scope.ServiceProvider.GetRequiredService<IElementService>();
                await elementService.RetryMissedAnalysisAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AnalysisRetryService encountered an error");
            }
        }
    }
}
