using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class ZoneService : IZoneService
    {
        private readonly IZoneRepository _zoneRepository;
        private readonly ICheckpointService _checkpointService;

        public ZoneService(IZoneRepository zoneRepository, ICheckpointService checkpointService)
        {
            _zoneRepository = zoneRepository;
            _checkpointService = checkpointService;
        }

        public async Task<IEnumerable<ZoneDto>> GetAllAsync()
        {
            var zones = await _zoneRepository.GetAllAsync();
            return zones.Select(z => new ZoneDto
            {
                Id         = z.Id,
                Name       = z.Name,
                Color      = z.Color,
                BoundaryId = z.BoundaryId,
                Boundary   = z.Boundary,
            });
        }

        public async Task<(bool Success, string? Error)> CreateAsync(CreateZoneDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return (false, "invalid_name");

            if (dto.Boundary == null)
                return (false, "invalid_geometry");

            var zone = new Zone
            {
                Name       = dto.Name,
                Color      = dto.Color,
                BoundaryId = dto.BoundaryId,
                Boundary   = dto.Boundary,
            };

            await _zoneRepository.AddAsync(zone);
            await _zoneRepository.SaveChangesAsync();
            await _checkpointService.AssignZonesForNewZoneAsync(zone.Id, zone.Boundary);
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateZoneDto dto)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return (false, "not_found");
            if (string.IsNullOrWhiteSpace(dto.Name)) return (false, "invalid_name");

            zone.Name       = dto.Name;
            zone.Color      = dto.Color;
            zone.BoundaryId = dto.BoundaryId;
            if (dto.Boundary != null) zone.Boundary = dto.Boundary;

            await _zoneRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return false;

            await _zoneRepository.DeleteAsync(zone);
            await _zoneRepository.SaveChangesAsync();
            return true;
        }
    }
}
