namespace Goalz.Core.DTOs
{
    public class GameStateResponse
    {
        public string Status { get; set; } = string.Empty;
        public List<MemberRoleDto> Members { get; set; } = [];
        public List<long> VisitedCheckpointIds { get; set; } = [];
        public int? GroupSize { get; set; }
        public long? BoundaryId { get; set; }
        public int? ZoneCount { get; set; }
        public int? CheckpointsPerZone { get; set; }
    }
}
