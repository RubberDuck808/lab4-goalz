using Goalz.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace Goalz.Core.Interfaces
{
    public interface IDatasetService
    {
        Task<List<string>> ReadCSV(IFormFile file);
        Task StoreCSVFile(List<string> file);
    }
}
