using Goalz.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace Goalz.Core.Interfaces
{
    public interface IDatasetService
    {
        public Task<List<string>> ReadCSV(IFormFile file);
    }
}
