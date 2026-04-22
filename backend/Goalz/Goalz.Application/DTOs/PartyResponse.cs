using Goalz.Domain.Entities;

namespace Goalz.Core.DTOs
{
    public class PartyResponse
    {
        public long Id { get; set; }
        public long QuizId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Members { get; set; } = [];
        public long Code { get; set; }
    } 
}