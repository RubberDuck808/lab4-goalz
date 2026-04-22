using Goalz.Core.DTOs; 
using Goalz.Core.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<User> GetUserByEmail(string email);
    }
}
