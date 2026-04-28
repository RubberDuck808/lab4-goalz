using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services
{
    public class BoundaryService : IBoundaryService
    {
        private readonly IBoundaryRepository _boundaryRepository;

        public BoundaryService(IBoundaryRepository boundaryRepository)
        {
            _boundaryRepository = boundaryRepository;
        }

        public async Task<IEnumerable<BoundaryDto>> GetAllAsync()
        {
            var boundaries = await _boundaryRepository.GetAllAsync();
            return boundaries.Select(b => new BoundaryDto
            {
                Id       = b.Id,
                Name     = b.Name,
                Color    = b.Color,
                Boundary = b.Geometry,
            });
        }

        public async Task<(bool Success, string? Error)> CreateAsync(CreateBoundaryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return (false, "invalid_name");

            if (dto.Boundary == null)
                return (false, "invalid_geometry");

            var boundary = new Boundary
            {
                Name     = dto.Name,
                Color    = dto.Color,
                Geometry = dto.Boundary,
            };

            await _boundaryRepository.AddAsync(boundary);
            await _boundaryRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateBoundaryDto dto)
        {
            var boundary = await _boundaryRepository.GetByIdAsync(id);
            if (boundary == null) return (false, "not_found");
            if (string.IsNullOrWhiteSpace(dto.Name)) return (false, "invalid_name");

            boundary.Name  = dto.Name;
            boundary.Color = dto.Color;
            if (dto.Boundary != null) boundary.Geometry = dto.Boundary;

            await _boundaryRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var boundary = await _boundaryRepository.GetByIdAsync(id);
            if (boundary == null) return false;

            await _boundaryRepository.DeleteAsync(boundary);
            await _boundaryRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Geometry>> GeneratePreviewAsync(long boundaryId, int count)
        {
            count = Math.Clamp(count, 1, 50);

            var boundary = await _boundaryRepository.GetByIdAsync(boundaryId);
            if (boundary is null) return [];

            var geom = boundary.Geometry;
            var env  = geom.EnvelopeInternal;
            var gf   = new GeometryFactory(new PrecisionModel(PrecisionModels.Floating), 4326);

            var width  = env.MaxX - env.MinX;
            var height = env.MaxY - env.MinY;
            bool splitByX = width >= height;

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

                var intersection = geom.Intersection(strip);
                if (!intersection.IsEmpty)
                    results.Add(intersection);
            }

            return results;
        }
    }
}
