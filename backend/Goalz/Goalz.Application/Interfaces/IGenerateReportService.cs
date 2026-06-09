using Goalz.Core.DTOs;
using System.Collections.Generic;

namespace Goalz.Core.Interfaces
{
    public interface IGenerateReportService
    {
        IAsyncEnumerable<string> StreamReportAsync(GenerateReportDto settings);
    }
}
