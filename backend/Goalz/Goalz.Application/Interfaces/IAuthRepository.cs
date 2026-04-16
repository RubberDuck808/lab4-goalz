using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByEmail(string email);
    }
}
