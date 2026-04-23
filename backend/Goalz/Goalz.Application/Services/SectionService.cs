using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class SectionService : ISectionService
    {
        private readonly ISectionRepository _sectionRepository;

        public SectionService(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }

        public async Task<IEnumerable<SectionSummaryDto>> GetAllAsync()
        {
            var sections = await _sectionRepository.GetAllOrderedAsync();

            return sections.Select((s, index) => new SectionSummaryDto
            {
                Id = s.Id,
                Name = s.Zone.Name,
                OrderIndex = s.OrderIndex,
                IsLocked = index > 0,
                Boundary = s.Zone.Boundary
            });
        }

        public async Task<SectionDetailDto?> GetByIdAsync(long id)
        {
            var section = await _sectionRepository.GetByIdWithCheckpointsAsync(id);
            if (section == null) return null;

            return new SectionDetailDto
            {
                Id = section.Id,
                Name = section.Zone.Name,
                OrderIndex = section.OrderIndex,
                CompletionCriteria = section.CompletionCriteria,
                IsLocked = false,
                Boundary = section.Zone.Boundary,
                Checkpoints = section.Checkpoints.Select(c => new CheckpointDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Lat = c.Location.Y,
                    Lng = c.Location.X
                })
            };
        }
    }
}
