using System.Text;
using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IGenerateReportService
    {
        public StringBuilder GenerateReport(GenerateReportDto settings);
    }
}
