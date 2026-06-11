using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByEmail(string email);
        Task<User> CreateUserAsync(User user);
        Task<IEnumerable<User>> GetAllStaffAndAdminAsync();
        Task<User?> GetByIdAsync(long id);
        Task DeleteUserAsync(User user);
        Task SaveChangesAsync();
    }
}
