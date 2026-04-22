using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class ZoneService : IZoneService
    {
        private readonly IZoneRepository _zoneRepository;

        public ZoneService(IZoneRepository zoneRepository)
        {
            _zoneRepository = zoneRepository;
        }

        public async Task<IEnumerable<ZoneDto>> GetAllAsync()
        {
            var zones = await _zoneRepository.GetAllAsync();
            return zones.Select(z => new ZoneDto
            {
                Id = z.Id,
                Name = z.Name,
                ZoneType = z.ZoneType,
                Color = z.Color,
                Boundary = z.Boundary
            });
        }

        private static readonly string[] ValidZoneTypes = { "boundary", "area", "path" };

        public async Task<(bool Success, string? Error)> CreateAsync(CreateZoneDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return (false, "invalid_name");

            if (!ValidZoneTypes.Contains(dto.ZoneType))
                return (false, "invalid_zone_type");

            if (dto.Boundary == null)
                return (false, "invalid_geometry");

            var zone = new Zone
            {
                Name = dto.Name,
                ZoneType = dto.ZoneType,
                Color = dto.Color,
                Boundary = dto.Boundary
            };

            await _zoneRepository.AddAsync(zone);
            await _zoneRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateZoneDto dto)
        {
            var zone = await _zoneRepository.GetByIdAsync(id);
            if (zone == null) return (false, "not_found");
            if (string.IsNullOrWhiteSpace(dto.Name)) return (false, "invalid_name");
            if (!ValidZoneTypes.Contains(dto.ZoneType)) return (false, "invalid_zone_type");

            zone.Name = dto.Name;
            zone.ZoneType = dto.ZoneType;
            zone.Color = dto.Color;
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
