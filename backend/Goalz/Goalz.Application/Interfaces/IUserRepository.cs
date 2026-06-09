using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(long id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> SearchByUsernameAsync(string query, string excludeUsername, int limit = 10);
        Task<User?> GetByUsernameAsync(string username);
        Task<bool> ExistsByEmailAsync(string email);
        Task<bool> ExistsByUsernameAsync(string username);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task SaveChangesAsync();

        // Statistics
        Task AddGameStatsAsync(string username, int checkpointsVisited, int quizScore);
        Task IncrementPartiesJoinedAsync(string username);
        Task IncrementPicturesTakenAsync(string username);
        Task<UserStatisticsDto> GetStatsAsync(string username);
        Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(string? period = null, int limit = 50);
    }
}
