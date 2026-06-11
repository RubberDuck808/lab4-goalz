using Goalz.Application.Interfaces;

namespace Goalz.Api.Services;

public class PartyCleanupService(IServiceScopeFactory scopeFactory, ILogger<PartyCleanupService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan LobbyTimeout = TimeSpan.FromMinutes(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Interval, stoppingToken);
            await CleanupAsync();
        }
    }

    private async Task CleanupAsync()
    {
        using var scope = scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IPartyRepository>();

        var cutoff = DateTime.UtcNow - LobbyTimeout;
        var stale = await repo.GetStaleLobbyPartiesAsync(cutoff);

        foreach (var party in stale)
        {
            try
            {
                await repo.DeleteAsync(party);
                logger.LogInformation("Deleted stale lobby party {PartyId} ({PartyName})", party.Id, party.Name);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete stale party {PartyId}", party.Id);
            }
        }
    }
}
