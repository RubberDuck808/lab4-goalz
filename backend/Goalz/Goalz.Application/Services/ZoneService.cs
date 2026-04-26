using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

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
            await _checkpointService.AssignZonesForNewZoneAsync(zone.Id, zone.Boundary, zone.ZoneType);
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

        public async Task<IEnumerable<Geometry>> GenerateZonePreviewAsync(long boundaryId, int count)
        {
            count = Math.Clamp(count, 1, 50);

            var zone = await _zoneRepository.GetByIdAsync(boundaryId);
            if (zone is null || zone.ZoneType != "boundary") return [];

            var boundary = zone.Boundary;
            var env      = boundary.EnvelopeInternal;
            var gf       = new GeometryFactory(new PrecisionModel(PrecisionModels.Floating), 4326);

            var width    = env.MaxX - env.MinX;
            var height   = env.MaxY - env.MinY;
            bool splitByX = width >= height; // split along the longer axis

            var results = new List<Geometry>();

            for (int i = 0; i < count; i++)
            {
                Polygon strip;
                if (splitByX)
                {
                    var sliceW = width / count;
                    var x0 = env.MinX + i * sliceW;
                    var x1 = env.MinX + (i + 1) * sliceW;
                    strip = gf.CreatePolygon([
                        new Coordinate(x0, env.MinY),
                        new Coordinate(x1, env.MinY),
                        new Coordinate(x1, env.MaxY),
                        new Coordinate(x0, env.MaxY),
                        new Coordinate(x0, env.MinY),
                    ]);
                }
                else
                {
                    var sliceH = height / count;
                    var y0 = env.MinY + i * sliceH;
                    var y1 = env.MinY + (i + 1) * sliceH;
                    strip = gf.CreatePolygon([
                        new Coordinate(env.MinX, y0),
                        new Coordinate(env.MaxX, y0),
                        new Coordinate(env.MaxX, y1),
                        new Coordinate(env.MinX, y1),
                        new Coordinate(env.MinX, y0),
                    ]);
                }

                var intersection = boundary.Intersection(strip);
                if (!intersection.IsEmpty)
                    results.Add(intersection);
            }

            return results;
        }
    }
}
