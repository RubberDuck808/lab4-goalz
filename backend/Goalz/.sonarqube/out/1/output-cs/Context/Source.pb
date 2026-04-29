Í
\/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/BoundaryDto.csÙusing NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class BoundaryDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public Geometry Boundary { get; set; } = null!;  // named Boundary to match ZoneDto.Boundary in frontend
    }
}
ParseOptions.0.jsonƒ
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/ChangeRoleRequest.cs»namespace Goalz.Core.DTOs
{
    public class ChangeRoleRequest
    {
        public string AdminEmail { get; set; } = string.Empty;
        public string NewRole { get; set; } = string.Empty;
    }
}
ParseOptions.0.jsonˇ
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/CheckpointDto.csánamespace Goalz.Core.DTOs;

public class CheckpointDto
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;   // "sensor" | "element"
    public long ReferenceId { get; set; }
    public long? ZoneId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public long? ElementTypeId { get; set; }  // null for sensors
    public bool? IsGreen { get; set; }        // null for sensors
    public string Name { get; set; } = string.Empty;
}
ParseOptions.0.jsonï
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/CreateBoundaryDto.csôusing NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class CreateBoundaryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#1A5C2E";
        public Geometry Boundary { get; set; } = null!;
    }
}
ParseOptions.0.json‹
e/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/CreateElementRequest.cs›namespace Goalz.Core.DTOs;

public class CreateElementRequest
{
    public string ElementName { get; set; } = string.Empty;
    public string ElementType { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
}
ParseOptions.0.jsonÕ
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/CreateSensorRequest.csœnamespace Goalz.Core.DTOs;

public class CreateSensorRequest
{
    public string SensorName { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
}
ParseOptions.0.json¬
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/CreateStaffUserRequest.cs¡namespace Goalz.Core.DTOs
{
    public class CreateStaffUserRequest
    {
        public string AdminEmail { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
ParseOptions.0.jsonª
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/CreateZoneDto.cs√using NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class CreateZoneDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#33A661";
        public long? BoundaryId { get; set; }
        public Geometry Boundary { get; set; } = null!;
    }
}
ParseOptions.0.jsonπ
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/DashboardLoginResponse.cs∏namespace Goalz.Core.DTOs
{
    public class DashboardLoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
ParseOptions.0.jsonÉ
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/DashboardSignUpRequest.csÇnamespace Goalz.Core.DTOs
{
    public class DashboardSignUpRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
ParseOptions.0.json‚
_/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/DatasetPreview.csÈnamespace Goalz.Core.DTOs
{
    public class DatasetPreview
    {
        public List<string> ColumnNames { get; set; } = new List<string>();
        public List<List<string>> values { get; set; } = new List<List<string>>();
    }
}
ParseOptions.0.jsonÌ
\/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/ElementsDTO.cs˜using Goalz.Domain.Entities;

namespace Goalz.Core.DTOs
{
    public class ElementsDTO
    {
        public List<Sensor> sensors { get; set; } = new List<Sensor>();
        public List<Element> element { get; set; } = new List<Element>();
    }
}
ParseOptions.0.json•
Z/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/FriendDto.cs±namespace Goalz.Core.DTOs
{
    public class FriendDto
    {
        public long FriendshipId { get; set; }
        public string Username { get; set; } = string.Empty;
    }
}
ParseOptions.0.json”
a/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/FriendRequestDto.csÿnamespace Goalz.Core.DTOs
{
    public class FriendRequestDto
    {
        public string RequesterUsername { get; set; } = string.Empty;
        public string AddresseeUsername { get; set; } = string.Empty;
    }
}
ParseOptions.0.jsonæ
a/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/GameLoginRequest.cs√namespace Goalz.Core.DTOs
{
    public class GameLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
ParseOptions.0.json„
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/GameLoginResponse.csÁnamespace Goalz.Core.DTOs
{
    public class GameLoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
ParseOptions.0.json∂
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/GameSignUpRequest.cs∫namespace Goalz.Core.DTOs
{
    public class GameSignUpRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
ParseOptions.0.jsonµ
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/GameSignUpResponse.cs∏namespace Goalz.Core.DTOs
{
    public class GameSignUpResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
ParseOptions.0.json¡
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/GameStateResponse.cs≈namespace Goalz.Core.DTOs
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
ParseOptions.0.jsonΩ
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/GenerateReportDto.cs¡namespace Goalz.Core.DTOs
{
    public class GenerateReportDto
    {
        public DateTime DateTimeFrom { get; set; }
        public DateTime DateTimeTo { get; set; }
        public ReportSettingsDto reportContents { get; set; } = new ReportSettingsDto();
        public ReportTypeEnum ReportType { get; set; }
    }
}
ParseOptions.0.jsonÏ
a/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/JoinPartyRequest.csrnamespace Goalz.Core.DTOs
{
    public class JoinPartyRequest
    {
        public long Code { get; set; }
    }
}ParseOptions.0.json≤
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/LobbyResponse.cs∫namespace Goalz.Core.DTOs
{
    public class LobbyResponse
    {
        public long PartyId { get; set; }
        public string PartyName { get; set; } = string.Empty;
        public List<string> Members { get; set; } = [];
        public long Code { get; set; }
        public bool IsReady { get; set; }
    }
}
ParseOptions.0.jsonÔ
]/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/LoginRequest.cs¯namespace Goalz.Core.DTOs
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}ParseOptions.0.json®
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/MemberRoleDto.cs∞namespace Goalz.Core.DTOs
{
    public class MemberRoleDto
    {
        public string Username { get; set; } = string.Empty;
        public string? Role { get; set; }
    }
}
ParseOptions.0.jsonà
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/PartnerUsernameDto.csãnamespace Goalz.Core.DTOs
{
    public class PartnerUsernameDto
    {
        public string Username { get; set; } = string.Empty;
    }
}
ParseOptions.0.json 
]/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/PartyRequest.cs”namespace Goalz.Core.DTOs
{
    public class PartyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int? GroupSize { get; set; }
        public long? BoundaryId { get; set; }
        public int? ZoneCount { get; set; }
        public int? CheckpointsPerZone { get; set; }
    }
}
//Ein DTO tr√§gt die Daten (hier: Name, Username), die ein Controller entgegennimmt (Request),
//der Service verarbeitet die Daten in der Business-Logik und der Controller gibt das Ergebnis
//wieder zur√ºck (Response).ParseOptions.0.json≈
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/PartyResponse.csÕusing Goalz.Domain.Entities;

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
}ParseOptions.0.jsonë
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/ReportSettingsDto.csïnamespace Goalz.Core.DTOs
{
    public class ReportSettingsDto
    {
        public bool Trees { get; set; }
        public bool Bushes { get; set; }
        public bool Water { get; set; }
        public bool Species { get; set; }
        public bool SensorData { get; set; }
        public bool Temperature { get; set; }
        public bool Light { get; set; }
        public bool Humidity { get; set; }
        public bool GreenVsNonGreen { get; set; }
        public bool NativeVsNonNative { get; set; }
        public bool Biodiversity { get; set; }
        public bool NetZeroGoal { get; set; }
        public bool LineCharts { get; set; }
        public bool BarCharts { get; set; }
        public bool PieCharts { get; set; }
        public bool AlboretumMap { get; set; }
    }
}
ParseOptions.0.jsonı
_/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/ReportTypeEnum.cs}namespace Goalz.Core.DTOs
{
    public enum ReportTypeEnum
    {
        CSV = 1,
        PDF = 2,
        Text = 3,
    }
}
ParseOptions.0.jsonÄ
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/SensorDataResponse.csÉnamespace Goalz.Core.DTOs;

public record SensorDataResponse(long Id, long Light, long Humidity, double Temp, DateTime Timestamp);
ParseOptions.0.jsonê
]/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/StaffUserDto.csônamespace Goalz.Core.DTOs
{
    public class StaffUserDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
ParseOptions.0.jsonç
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/UpdateBoundaryDto.csëusing NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class UpdateBoundaryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#1A5C2E";
        public Geometry? Boundary { get; set; }
    }
}
ParseOptions.0.json‹
e/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/UpdateElementRequest.cs›namespace Goalz.Core.DTOs;

public class UpdateElementRequest
{
    public string ElementName { get; set; } = string.Empty;
    public string ElementType { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
}
ParseOptions.0.jsonÕ
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/UpdateSensorRequest.csœnamespace Goalz.Core.DTOs;

public class UpdateSensorRequest
{
    public string SensorName { get; set; } = string.Empty;
    public double Longitude { get; set; }
    public double Latitude { get; set; }
}
ParseOptions.0.json≥
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/UpdateZoneDto.csªusing NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class UpdateZoneDto
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#33A661";
        public long? BoundaryId { get; set; }
        public Geometry? Boundary { get; set; }
    }
}
ParseOptions.0.json˛
^/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/UserSearchDto.csÜnamespace Goalz.Core.DTOs
{
    public class UserSearchDto
    {
        public string Username { get; set; } = string.Empty;
    }
}
ParseOptions.0.json◊
X/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/DTOs/ZoneDto.csÂusing NetTopologySuite.Geometries;

namespace Goalz.Core.DTOs
{
    public class ZoneDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public long? BoundaryId { get; set; }
        public Geometry Boundary { get; set; } = null!;
    }
}
ParseOptions.0.jsonÖ
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IAuthRepository.csÖusing Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByEmail(string email);
        Task<User> CreateUserAsync(User user);
        Task<IEnumerable<User>> GetAllStaffAndAdminAsync();
        Task<User?> GetByIdAsync(long id);
        Task DeleteUserAsync(User user);
        Task SaveChangesAsync();
    }
}
ParseOptions.0.json‡
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IAuthService.cs„using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IAuthService
    {
        Task<DashboardLoginResponse?> CheckAuth(string email, string password);
        Task<(DashboardLoginResponse? Result, string? Error)> CreateStaffUserAsync(CreateStaffUserRequest request);
        Task<(IEnumerable<StaffUserDto>? Users, string? Error)> GetStaffUsersAsync(string adminEmail);
        Task<(bool Success, string? Error)> ChangeUserRoleAsync(string adminEmail, long userId, string newRole);
        Task<(bool Success, string? Error)> DeleteUserAsync(string adminEmail, long userId);
    }
}
ParseOptions.0.json’
j/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IBoundaryRepository.cs—using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IBoundaryRepository
    {
        Task<IEnumerable<Boundary>> GetAllAsync();
        Task<Boundary?> GetByIdAsync(long id);
        Task AddAsync(Boundary boundary);
        Task DeleteAsync(Boundary boundary);
        Task SaveChangesAsync();
    }
}
ParseOptions.0.json
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IBoundaryService.csÔusing Goalz.Core.DTOs;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces
{
    public interface IBoundaryService
    {
        Task<IEnumerable<BoundaryDto>> GetAllAsync();
        Task<(bool Success, string? Error)> CreateAsync(CreateBoundaryDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateBoundaryDto dto);
        Task<bool> DeleteAsync(long id);
        Task<IEnumerable<Geometry>> GeneratePreviewAsync(long boundaryId, int count);
    }
}
ParseOptions.0.json—
l/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ICheckpointRepository.csÀusing Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces;

public interface ICheckpointRepository
{
    Task<IEnumerable<Checkpoint>> GetAllAsync();
    Task<IEnumerable<Checkpoint>> FindInsideBoundaryAsync(Geometry boundary);
    Task<Checkpoint?> GetByReferenceAsync(string type, long referenceId);
    Task AddAsync(Checkpoint checkpoint);
    Task DeleteAsync(Checkpoint checkpoint);
    Task SaveChangesAsync();
}
ParseOptions.0.jsonø
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ICheckpointService.csºusing Goalz.Core.DTOs;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces;

public interface ICheckpointService
{
    Task<IEnumerable<CheckpointDto>> GetAllAsync();
    Task CreateForElementAsync(long elementId, Point location);
    Task CreateForSensorAsync(long sensorId, Point location);
    Task AssignZonesForNewZoneAsync(long zoneId, Geometry boundary);
    Task DeleteByReferenceAsync(string type, long referenceId);
}
ParseOptions.0.json
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IDatasetService.csusing Goalz.Core.DTOs;
using Microsoft.AspNetCore.Http;

namespace Goalz.Core.Interfaces
{
    public interface IDatasetService
    {
        Task<List<string>> ReadCSV(IFormFile file);
        Task StoreCSVFile(List<string> file);
    }
}
ParseOptions.0.jsonª
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IElementRepository.cs∏using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IElementRepository
{
    Task<Element> CreateAsync(Element element);
    Task<Element?> GetByIdAsync(long id);
    Task<bool> UpdateAsync(Element element);
    Task<bool> DeleteAsync(long id);
    Task<ElementType?> GetElementTypeByNameAsync(string name);
    Task<ElementType> CreateElementTypeAsync(string name);
    Task<List<ElementType>> GetAllElementTypesAsync();
    Task<IEnumerable<Element>> GetByIdsAsync(IEnumerable<long> ids);
    Task<IEnumerable<Element>> GetAllAsync();
}
ParseOptions.0.json“
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IElementService.cs“using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IElementService
{
    Task<Element> CreateAsync(CreateElementRequest request);
    Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateElementRequest request);
    Task<(bool Success, string? Error)> DeleteAsync(long id);
}ParseOptions.0.jsonÔ
l/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IFriendshipRepository.csÈusing Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IFriendshipRepository
    {
        Task AddAsync(Friendship friendship);
        Task<Friendship?> GetByUsersAsync(long requesterId, long addresseeId);
        Task<Friendship?> GetBetweenUsersAsync(long userAId, long userBId);
        Task<IEnumerable<Friendship>> GetAcceptedAsync(long userId);
        Task<IEnumerable<Friendship>> GetPendingReceivedAsync(long userId);
        Task<bool> ExistsAsync(long requesterId, long addresseeId);
        void DeleteAsync(Friendship friendship);
        Task SaveChangesAsync();
    }
}
ParseOptions.0.json»
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IFriendshipService.cs≈using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IFriendshipService
    {
        Task<IEnumerable<FriendDto>> GetConnectionsAsync(string username);
        Task<IEnumerable<FriendDto>> GetRequestsAsync(string username);
        Task<(bool Success, string? Error)> SendRequestAsync(string requesterUsername, string addresseeUsername);
        Task<(bool Success, string? Error)> AcceptRequestAsync(string requesterUsername, string addresseeUsername);
        Task<(bool Success, string? Error)> DeclineRequestAsync(string requesterUsername, string addresseeUsername);
        Task<(bool Success, string? Error)> RemoveConnectionAsync(string usernameA, string usernameB);
    }
}
ParseOptions.0.json◊
m/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IGenerateReportService.cs–using System.Text;
using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IGenerateReportService
    {
        public StringBuilder GenerateReport(GenerateReportDto settings);
    }
}
ParseOptions.0.json»
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IJwtService.csÃnamespace Goalz.Core.Interfaces
{
    public interface IJwtService
    {
        string Generate(string username, string role);
        string Generate(string username, string role, string name);
    }
}
ParseOptions.0.jsonØ
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ILobbyService.cs±using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface ILobbyService
    {
        Task<LobbyResponse> JoinLobby(long partyId, string username);
    }
}
ParseOptions.0.json™
o/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/INatureElementRepository.cs°using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface INatureElementRepository
    {
        List<ElementType> GetAllElementTypes();
        void StoreElements(List<Element> elements);
        ElementType GetNatureElementTypeByName(string typeName);
    }
}
ParseOptions.0.json»
j/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IOverviewRepository.csƒusing Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IOverviewRepository
{
    Task<List<Sensor>> GetAllSensorsAsync();
    Task<List<Element>> GetAllElementsAsync();
}ParseOptions.0.json≠
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IOverviewService.cs¨using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IOverviewService
{
    Task<ElementsDTO> GetDashboardData();
    
}
ParseOptions.0.jsonê
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IPartyRepository.csèusing Goalz.Domain.Entities;

namespace Goalz.Application.Interfaces
{
    public interface IPartyRepository 
    {
        Task<Party> CreateAsync(Party party);
        Task<Party?> GetPartyById(long id);
        Task SaveChangesAsync();
        Task<PartyMember> AddMemberAsync(PartyMember member);
        Task<Party?> GetPartyByCode(long Code);
        Task<PartyGroup?> GetPartyGroupByPartyIdAsync(long partyId);
        Task AddGroupAsync(PartyGroup group);
        Task<List<string>> GetLobbyMembers(long partyId);
        Task<List<PartyMember>> GetPartyMembersWithUsersAsync(long partyId);
        Task<List<long>> GetVisitedCheckpointsAsync(long partyId);
        Task VisitCheckpointAsync(long partyId, long checkpointId);
        Task<bool> IsMemberAsync(long partyId, long userId);
        Task<List<Party>> GetStaleLobbyPartiesAsync(DateTime cutoff);
        Task DeleteAsync(Party party);
    }
}ParseOptions.0.jsonó
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IPartyService.csôusing Goalz.Core.DTOs;
namespace Goalz.Core.Interfaces
{
    public interface IPartyService
    {
        Task<PartyResponse> CreateParty(PartyRequest request, string creatorUsername);
        Task<PartyResponse?> JoinParty(long Code, string username);
        Task<PartyResponse> GetParty(int partyId);
        Task<List<string>> GetLobbyMembers(long partyId);
        Task<bool> StartGame(long partyId);
        Task<GameStateResponse?> GetGameState(long partyId);
        Task VisitCheckpoint(long partyId, long checkpointId);
    }
}ParseOptions.0.json†
l/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ISensorDataRepository.csöusing Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorDataRepository
{
    Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId);
    Task<IEnumerable<SensorData>> GetSensorsByTimeRangeAsync(DateTime dateTimeFrom, DateTime dateTimeTo);
}
ParseOptions.0.json≤
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ISensorDataService.csØusing Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces;

public interface ISensorDataService
{
    Task<IEnumerable<SensorDataResponse>> GetBySensorIdAsync(long sensorId);
}
ParseOptions.0.json“
h/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ISensorRepository.cs–using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorRepository
{
    Task<Sensor> CreateAsync(Sensor sensor);
    Task<Sensor?> GetByIdAsync(long id);
    Task<bool> UpdateAsync(Sensor sensor);
    Task<bool> DeleteAsync(long id);
    Task<IEnumerable<Sensor>> GetByIdsAsync(IEnumerable<long> ids);
}ParseOptions.0.jsonÕ
e/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/ISensorService.csŒusing Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorService
{
    Task<Sensor> CreateAsync(CreateSensorRequest request);
    Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateSensorRequest request);
    Task<(bool Success, string? Error)> DeleteAsync(long id);
}ParseOptions.0.json™
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IUserRepository.cs™using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(long id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> SearchByUsernameAsync(string query, string excludeUsername, int limit = 10);
        Task<User?> GetByUsernameAsync(string username);
        Task<bool> ExistsByEmailAsync(string email);
        Task<bool> ExistsByUsernameAsync(string username);
        Task AddAsync(User user);
        Task SaveChangesAsync();
    }
}
ParseOptions.0.jsoné
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IUserService.csëusing Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IUserService
    {
        Task<GameLoginResponse?> LoginAsync(GameLoginRequest request);
        Task<(GameSignUpResponse? User, string? Error)> SignUpAsync(GameSignUpRequest request);
    }
}
ParseOptions.0.jsoní
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IZoneRepository.csíusing Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces
{
    public interface IZoneRepository
    {
        Task<IEnumerable<Zone>> GetAllAsync();
        Task<Zone?> GetByIdAsync(long id);
        Task AddAsync(Zone zone);
        Task DeleteAsync(Zone zone);
        Task SaveChangesAsync();
        Task<Zone?> FindContainingZoneAsync(Point point);
    }
}
ParseOptions.0.json„
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Interfaces/IZoneService.csÊusing Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IZoneService
    {
        Task<IEnumerable<ZoneDto>> GetAllAsync();
        Task<(bool Success, string? Error)> CreateAsync(CreateZoneDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateZoneDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
ParseOptions.0.json≥!
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/AuthService.csπ using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;

        public AuthService(IAuthRepository authRepository, IJwtService jwtService)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
        }

        public async Task<DashboardLoginResponse?> CheckAuth(string email, string password)
        {
            var user = await _authRepository.GetUserByEmail(email);

            if (user != null)
            {
                bool isverify = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

                if (isverify)
                {
                    return new DashboardLoginResponse
                    {
                        Token = _jwtService.Generate(user.Email, user.Role.ToString(), user.Name),
                        Email = user.Email,
                        Name = user.Name,
                        Role = user.Role.ToString()
                    };
                }
            }

            return null;
        }

        public async Task<(DashboardLoginResponse? Result, string? Error)> CreateStaffUserAsync(CreateStaffUserRequest request)
        {
            var admin = await _authRepository.GetUserByEmail(request.AdminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (null, "unauthorized");

            var existing = await _authRepository.GetUserByEmail(request.Email);
            if (existing != null)
                return (null, "email_taken");

            var user = new User
            {
                Username = request.Email,
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Role.Staff
            };

            await _authRepository.CreateUserAsync(user);

            return (new DashboardLoginResponse { Email = user.Email, Name = user.Name, Role = user.Role.ToString() }, null);
        }

        public async Task<(IEnumerable<StaffUserDto>? Users, string? Error)> GetStaffUsersAsync(string adminEmail)
        {
            var admin = await _authRepository.GetUserByEmail(adminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (null, "unauthorized");

            var users = await _authRepository.GetAllStaffAndAdminAsync();
            return (users.Select(u => new StaffUserDto { Id = u.Id, Name = u.Name, Email = u.Email, Role = u.Role.ToString() }), null);
        }

        public async Task<(bool Success, string? Error)> ChangeUserRoleAsync(string adminEmail, long userId, string newRole)
        {
            var admin = await _authRepository.GetUserByEmail(adminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (false, "unauthorized");

            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null)
                return (false, "not_found");

            if (!Enum.TryParse<Role>(newRole, ignoreCase: true, out var role) || role == Role.Player)
                return (false, "invalid_role");

            user.Role = role;
            await _authRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeleteUserAsync(string adminEmail, long userId)
        {
            var admin = await _authRepository.GetUserByEmail(adminEmail);
            if (admin == null || admin.Role != Role.Admin)
                return (false, "unauthorized");

            var user = await _authRepository.GetByIdAsync(userId);
            if (user == null)
                return (false, "not_found");

            if (user.Id == admin.Id)
                return (false, "cannot_self_delete");

            await _authRepository.DeleteUserAsync(user);
            await _authRepository.SaveChangesAsync();
            return (true, null);
        }
    }
}ParseOptions.0.jsonﬁ#
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/BoundaryService.cs‡"using Goalz.Core.DTOs;
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
ParseOptions.0.jsonª&
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/CheckpointService.csª%using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class CheckpointService : ICheckpointService
{
    private readonly ICheckpointRepository _checkpointRepository;
    private readonly IZoneRepository _zoneRepository;
    private readonly IElementRepository _elementRepository;
    private readonly ISensorRepository _sensorRepository;

    public CheckpointService(
        ICheckpointRepository checkpointRepository,
        IZoneRepository zoneRepository,
        IElementRepository elementRepository,
        ISensorRepository sensorRepository)
    {
        _checkpointRepository = checkpointRepository;
        _zoneRepository = zoneRepository;
        _elementRepository = elementRepository;
        _sensorRepository = sensorRepository;
    }

    public async Task<IEnumerable<CheckpointDto>> GetAllAsync()
    {
        var checkpoints = (await _checkpointRepository.GetAllAsync()).ToList();

        var elementRefIds = checkpoints.Where(c => c.Type == "element").Select(c => c.ReferenceId).ToHashSet();
        var sensorRefIds  = checkpoints.Where(c => c.Type == "sensor").Select(c => c.ReferenceId).ToList();

        var elementsById = (await _elementRepository.GetByIdsAsync(elementRefIds)).ToDictionary(e => e.Id);
        var sensorsById  = (await _sensorRepository.GetByIdsAsync(sensorRefIds)).ToDictionary(s => s.Id);

        var checkpointDtos = checkpoints.Select(cp =>
        {
            var dto = new CheckpointDto
            {
                Id          = cp.Id,
                Type        = cp.Type,
                ReferenceId = cp.ReferenceId,
                ZoneId      = cp.ZoneId,
                Latitude    = cp.Location.Y,
                Longitude   = cp.Location.X,
            };

            if (cp.Type == "element" && elementsById.TryGetValue(cp.ReferenceId, out var el))
            {
                dto.ElementTypeId = el.ElementTypeId;
                dto.IsGreen       = el.IsGreen;
                dto.Name          = el.ElementName;
            }
            else if (cp.Type == "sensor" && sensorsById.TryGetValue(cp.ReferenceId, out var s))
            {
                dto.Name = s.SensorName ?? $"Sensor {s.Id}";
            }

            return dto;
        }).ToList();

        // Include elements that have no checkpoint row so they appear on the map
        var allElements = await _elementRepository.GetAllAsync();
        var orphanDtos = allElements
            .Where(e => !elementRefIds.Contains(e.Id))
            .Select(e => new CheckpointDto
            {
                Id            = 0,
                Type          = "element",
                ReferenceId   = e.Id,
                ZoneId        = null,
                Latitude      = e.Geom.Y,
                Longitude     = e.Geom.X,
                ElementTypeId = e.ElementTypeId,
                IsGreen       = e.IsGreen,
                Name          = e.ElementName,
            });

        return checkpointDtos.Concat(orphanDtos);
    }

    public async Task CreateForElementAsync(long elementId, Point location)
    {
        var containingZone = await _zoneRepository.FindContainingZoneAsync(location);
        var checkpoint = new Checkpoint
        {
            Type        = "element",
            ReferenceId = elementId,
            Location    = location,
            ZoneId      = containingZone?.Id,
        };
        await _checkpointRepository.AddAsync(checkpoint);
        await _checkpointRepository.SaveChangesAsync();
    }

    public async Task CreateForSensorAsync(long sensorId, Point location)
    {
        var containingZone = await _zoneRepository.FindContainingZoneAsync(location);
        var checkpoint = new Checkpoint
        {
            Type        = "sensor",
            ReferenceId = sensorId,
            Location    = location,
            ZoneId      = containingZone?.Id,
        };
        await _checkpointRepository.AddAsync(checkpoint);
        await _checkpointRepository.SaveChangesAsync();
    }

    public async Task DeleteByReferenceAsync(string type, long referenceId)
    {
        var checkpoint = await _checkpointRepository.GetByReferenceAsync(type, referenceId);
        if (checkpoint is null) return;
        await _checkpointRepository.DeleteAsync(checkpoint);
        await _checkpointRepository.SaveChangesAsync();
    }

    public async Task AssignZonesForNewZoneAsync(long zoneId, Geometry boundary)
    {
        var inside = await _checkpointRepository.FindInsideBoundaryAsync(boundary);
        foreach (var cp in inside)
        {
            if (cp.ZoneId == null)
                cp.ZoneId = zoneId;
        }
        await _checkpointRepository.SaveChangesAsync();
    }
}
ParseOptions.0.json´)
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/DatasetService.csÆ(using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using Microsoft.AspNetCore.Http;
using NetTopologySuite.Geometries;
using System.Data;
using System.Text;

namespace Goalz.Core.Services
{
    public class DatasetService : IDatasetService
    {
        INatureElementRepository _natureElementRepository;
        public DatasetService(INatureElementRepository natureElementRepository)
        {
            _natureElementRepository = natureElementRepository;
        }

        public async Task<List<string>> ReadCSV(IFormFile file)
        {
            if (file == null)
            {
                throw new ArgumentNullException(nameof(file), "File cannot be null.");
            }

            DataTable dataTable = new DataTable();
            DatasetPreview datasetPreview = new DatasetPreview();

            List<string> col = new List<string>();

            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                bool isFirstRow = true;
                while (!reader.EndOfStream)
                {
                    var line = await reader.ReadLineAsync();
                    if (line == null) continue;

                    col.Add(line);
                }
            }

            return col;
        }

        public async Task StoreCSVFile(List<string> file)
        {
            bool isFirstRow = true;
            var dataTable = new DataTable();

            foreach (var line in file)
            {
                var cells = line.Split(';');

                if (isFirstRow)
                {
                    // Process header row
                    foreach (var cell in cells)
                    {
                        dataTable.Columns.Add(cell);
                    }

                    isFirstRow = false;
                }
                else
                { 
                    dataTable.Rows.Add(cells);
                }
            }

            ValidateFileStructure(dataTable);

            var elements = new List<Element>();
            foreach (DataRow row in dataTable.Rows)
            {
                var latitude = double.TryParse(row["Latitude"].ToString(), out var lat) ? lat : 0;
                var longitude = double.TryParse(row["Longitude"].ToString(), out var lng) ? lng : 0;
                var elementName = row["Type"].ToString() ?? string.Empty;
                var elementId = _natureElementRepository.GetNatureElementTypeByName(elementName)?.Id;

                if(elementId == null)
                {
                    throw new InvalidOperationException($"Element with name '{row["Type"]}' does not exist in the database. Please check the element name and try again.");
                }

                var element = new Element
                {
                    ElementName = row["Name"].ToString() ?? string.Empty,
                    ElementTypeId = Convert.ToInt32(elementId),
                    Geom = new Point(new Coordinate(latitude, longitude)),
                    IsGreen = bool.TryParse(row["IsGreen"].ToString(), out var isGreen) ? isGreen : false,
                    ImageUrl = row["ImageUrl"].ToString()
                };

                elements.Add(element);
            }

            _natureElementRepository.StoreElements(elements);
        }

        private void ValidateFileStructure(DataTable dataTable)
        {
            var requiredColumns = new List<string> { "Name", "Type", "Latitude", "Longitude", "IsGreen", "ImageUrl" };

            var missingColumns = requiredColumns.Where(col => !dataTable.Columns.Contains(col)).ToList();

            var columnNames = dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList();

            if (missingColumns.Any())
            {
                throw new Exception($"Missing required columns: {string.Join(", ", missingColumns)}");
            }

            if(columnNames.Count != requiredColumns.Count)
            {
                throw new Exception($"Unexpected number of columns. Expected: {requiredColumns.Count}, Found: {dataTable.Columns.Count}");
            }

            if (columnNames.Any(string.IsNullOrWhiteSpace))
            {
                throw new InvalidOperationException("One or more columns have empty names.");
            }

            var typeValues = dataTable.Rows
                .Cast<DataRow>()
                .Select(row => row["Type"].ToString())
                .Where(type => !string.IsNullOrWhiteSpace(type))
                .ToList();

            if (!ValidateElementTypes(typeValues))
            {
                throw new Exception("One or more element types are invalid. Please check the allowed types and try again.");
            }
        }

        private bool ValidateElementTypes(List<string> elementTypes)
        {
            var types = _natureElementRepository.GetAllElementTypes().Select(et => et.Name).ToList();

            foreach (var type in elementTypes)
            {
                if (!types.Contains(type))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
ParseOptions.0.json±
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/ElementService.cs¥using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class ElementService : IElementService
{
    private readonly IElementRepository _repository;
    private readonly ICheckpointService _checkpointService;

    public ElementService(IElementRepository repository, ICheckpointService checkpointService)
    {
        _repository = repository;
        _checkpointService = checkpointService;
    }

    public async Task<Element> CreateAsync(CreateElementRequest request)
    {
        var elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);

        var element = new Element
        {
            ElementName = request.ElementName,
            ElementTypeId = elementType.Id,
            Geom = new Point(request.Longitude, request.Latitude) { SRID = 4326 },
            ImageUrl = request.ImageUrl ?? string.Empty,
            IsGreen = request.IsGreen
        };
        await _repository.CreateAsync(element);
        await _checkpointService.CreateForElementAsync(element.Id, element.Geom);
        return element;
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateElementRequest request)
    {
        var element = await _repository.GetByIdAsync(id);
        if (element is null)
            return (false, "not_found");

        var elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);

        element.ElementName = request.ElementName;
        element.ElementTypeId = elementType.Id;
        element.Geom = new Point(request.Longitude, request.Latitude) { SRID = 4326 };
        element.ImageUrl = request.ImageUrl ?? string.Empty;
        element.IsGreen = request.IsGreen;

        await _repository.UpdateAsync(element);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(long id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted)
            return (false, "not_found");
        await _checkpointService.DeleteByReferenceAsync("element", id);
        return (true, null);
    }
}
ParseOptions.0.json”(
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/FriendshipService.cs”'using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class FriendshipService : IFriendshipService
    {
        private readonly IFriendshipRepository _friendshipRepository;
        private readonly IUserRepository _userRepository;

        public FriendshipService(IFriendshipRepository friendshipRepository, IUserRepository userRepository)
        {
            _friendshipRepository = friendshipRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<FriendDto>> GetConnectionsAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return [];

            var friendships = await _friendshipRepository.GetAcceptedAsync(user.Id);

            return friendships.Select(f =>
            {
                var friend = f.RequesterId == user.Id ? f.Addressee : f.Requester;
                return new FriendDto { FriendshipId = f.Id, Username = friend.Username };
            });
        }

        public async Task<IEnumerable<FriendDto>> GetRequestsAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null) return [];

            var friendships = await _friendshipRepository.GetPendingReceivedAsync(user.Id);

            return friendships.Select(f => new FriendDto
            {
                FriendshipId = f.Id,
                Username = f.Requester.Username
            });
        }

        public async Task<(bool Success, string? Error)> SendRequestAsync(string requesterUsername, string addresseeUsername)
        {
            if (requesterUsername.Equals(addresseeUsername, StringComparison.OrdinalIgnoreCase))
                return (false, "cannot_self_add");

            var requester = await _userRepository.GetByUsernameAsync(requesterUsername);
            if (requester == null) return (false, "user_not_found");

            var addressee = await _userRepository.GetByUsernameAsync(addresseeUsername);
            if (addressee == null) return (false, "user_not_found");

            var existing = await _friendshipRepository.GetBetweenUsersAsync(requester.Id, addressee.Id);
            if (existing != null)
                return (false, existing.Status == FriendshipStatus.Accepted ? "already_friends" : "request_exists");

            await _friendshipRepository.AddAsync(new Friendship
            {
                RequesterId = requester.Id,
                AddresseeId = addressee.Id
            });

            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AcceptRequestAsync(string requesterUsername, string addresseeUsername)
        {
            var requester = await _userRepository.GetByUsernameAsync(requesterUsername);
            var addressee = await _userRepository.GetByUsernameAsync(addresseeUsername);
            if (requester == null || addressee == null) return (false, "request_not_found");

            var friendship = await _friendshipRepository.GetByUsersAsync(requester.Id, addressee.Id);
            if (friendship == null) return (false, "request_not_found");

            if (friendship.Status != FriendshipStatus.Pending) return (false, "not_pending");

            friendship.Status = FriendshipStatus.Accepted;
            friendship.UpdatedAt = DateTime.UtcNow;

            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> DeclineRequestAsync(string requesterUsername, string addresseeUsername)
        {
            var requester = await _userRepository.GetByUsernameAsync(requesterUsername);
            var addressee = await _userRepository.GetByUsernameAsync(addresseeUsername);
            if (requester == null || addressee == null) return (false, "request_not_found");

            var friendship = await _friendshipRepository.GetByUsersAsync(requester.Id, addressee.Id);
            if (friendship == null) return (false, "request_not_found");

            _friendshipRepository.DeleteAsync(friendship);
            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(bool Success, string? Error)> RemoveConnectionAsync(string usernameA, string usernameB)
        {
            var userA = await _userRepository.GetByUsernameAsync(usernameA);
            var userB = await _userRepository.GetByUsernameAsync(usernameB);
            if (userA == null || userB == null) return (false, "user_not_found");

            var friendship = await _friendshipRepository.GetBetweenUsersAsync(userA.Id, userB.Id);
            if (friendship == null) return (false, "not_friends");

            _friendshipRepository.DeleteAsync(friendship);
            await _friendshipRepository.SaveChangesAsync();
            return (true, null);
        }
    }
}
ParseOptions.0.jsoní
j/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/GenerateReportService.cséusing System.Text;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using System.IO;

namespace Goalz.Core.Services
{
    public class GenerateReportService : IGenerateReportService
    {
        private ISensorDataRepository _sensorDataRepository;
        public GenerateReportService(ISensorDataRepository sensorDataRepository) 
        { 
            _sensorDataRepository = sensorDataRepository;
        }

        public StringBuilder GenerateReport(GenerateReportDto settings)
        {
            StringBuilder csvFile = new StringBuilder();

            ValidateSettings(settings);

            var dateTimeFrom = DateTime.SpecifyKind(settings.DateTimeFrom, DateTimeKind.Utc);
            var dateTimeTo = DateTime.SpecifyKind(settings.DateTimeTo, DateTimeKind.Utc);

            csvFile.Append(RenderReportContent(dateTimeFrom, dateTimeTo, settings.reportContents));

            return csvFile;
        }

        private void ValidateSettings(GenerateReportDto settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings), "Settings cannot be null.");
            }

            if (settings.reportContents == null)
            {
                throw new ArgumentException("Report contents must contain at least one value.");
            }

            if (settings.DateTimeFrom > settings.DateTimeTo)
            {
                throw new ArgumentException("DateTimeFrom cannot be later than DateTimeTo.");
            }

            if (settings.ReportType == 0)
            {
                throw new ArgumentException("ReportType must be a valid value.");
            }
        }

        private StringBuilder RenderReportContent(DateTime dateTimeFrom, DateTime dateTimeTo, ReportSettingsDto settings)
        {
            StringBuilder stringBuilder = new StringBuilder();

            if (settings.SensorData && (settings.Temperature || settings.Humidity || settings.Light))
            {
                var result = RenderSensorData(dateTimeFrom, dateTimeTo, settings.Temperature, settings.Light, settings.Humidity);

                stringBuilder.Append(result);
            }

            return stringBuilder;
        }

        private StringBuilder RenderNatureElement(DateTime dateTimeFrom, DateTime dateTimeTo, ReportSettingsDto settings)
        {
            StringBuilder stringBuilder = new StringBuilder();



            return stringBuilder;
        }

        private StringBuilder RenderSensorData(DateTime dateTimeFrom, DateTime dateTimeTo, bool temprature, bool light, bool humidity)
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.AppendLine("Sensor Id;Temprature;Humidity;Light;Timestamp");

            var sensorsData = _sensorDataRepository.GetSensorsByTimeRangeAsync(dateTimeFrom, dateTimeTo).Result;

            foreach (var data in sensorsData)
            {
                stringBuilder.Append(data.SensorsId);
                stringBuilder.Append(";");

                stringBuilder.Append(temprature ? data.Temp.ToString() : "");
                stringBuilder.Append(";");

                stringBuilder.Append(humidity ? data.Humidity.ToString() : "");
                stringBuilder.Append(";");

                stringBuilder.Append(light ? data.Light.ToString() : "");
                stringBuilder.Append(";");

                stringBuilder.Append(data.Timestamp.ToString("HH:mm:ss dd-MM-yyyy"));

                stringBuilder.AppendLine();
            }

            return stringBuilder;
        }
    }
}
ParseOptions.0.json∏	
a/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/LobbyService.csΩusing Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class LobbyService(IPartyRepository partyRepository, IUserRepository userRepository) : ILobbyService
    {
        private readonly IPartyRepository _partyRepository = partyRepository;
        private readonly IUserRepository _userRepository = userRepository;

        public async Task<LobbyResponse> JoinLobby(long partyId, string username)
        {
            var party = await _partyRepository.GetPartyById(partyId)
                ?? throw new Exception("Party not found");

            var user = await _userRepository.GetByUsernameAsync(username)
                ?? throw new Exception("User not found");

            var members = await _partyRepository.GetLobbyMembers(partyId);

            return new LobbyResponse
            {
                PartyId = party.Id,
                PartyName = party.Name,
                Members = members,
                Code = party.Code,
                IsReady = false
            };
        }
    }
}
ParseOptions.0.json∂
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/OverviewService.cs∏using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services;

public class OverviewService : IOverviewService
{
    private readonly IOverviewRepository _repository;

    public OverviewService(IOverviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<ElementsDTO> GetDashboardData()
    {
        return new ElementsDTO
        {
            sensors = await _repository.GetAllSensorsAsync(),
            element = await _repository.GetAllElementsAsync()
        };
    }
}ParseOptions.0.json˜4
a/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/PartyService.cs¸3using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Utils;
using Goalz.Domain.Entities;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class PartyService : IPartyService
    {
        private readonly IPartyRepository _partyRepository;
        private readonly IUserRepository _userRepository;

        public PartyService(IUserRepository userRepository, IPartyRepository partyRepository)
        {
            _userRepository = userRepository;
            _partyRepository = partyRepository;
        }
        //Es k√∂nnen nicht zwei Konstruktoren existieren, da der zweite den ersten √ºberschreibt

        public async Task<PartyResponse> CreateParty(PartyRequest request, string creatorUsername)
        {
            var party = new Party
            {
                Name = request.Name,
                Code = CodeGenerator.GeneratePartyCode(),
                GroupSize = request.GroupSize,
                BoundaryId = request.BoundaryId,
                ZoneCount = request.ZoneCount,
                CheckpointsPerZone = request.CheckpointsPerZone,
            };

            var createdParty = await _partyRepository.CreateAsync(party);
            await _partyRepository.SaveChangesAsync();

            var groups = new List<PartyGroup>
            {
                new() { PartyId = createdParty.Id, Name = "Team A" },
                new() { PartyId = createdParty.Id, Name = "Team B" },
                new() { PartyId = createdParty.Id, Name = "Team C" },
                new() { PartyId = createdParty.Id, Name = "Team D" },
            };

            foreach (var group in groups)
            {
                await _partyRepository.AddGroupAsync(group);
            }
            await _partyRepository.SaveChangesAsync();

            var creator = await _userRepository.GetByUsernameAsync(creatorUsername)
                ?? throw new Exception("Creator user not found");
            var firstGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(createdParty.Id)
                ?? throw new Exception("Party group not found");

            await _partyRepository.AddMemberAsync(new PartyMember
            {
                UserId = creator.Id,
                PartyGroupId = firstGroup.Id,
                PartyId = createdParty.Id
            });

            return new PartyResponse
            {
                Id = createdParty.Id,
                Name = createdParty.Name,
                Code = createdParty.Code,
                Members = [creatorUsername]
            };
        }

        public async Task<PartyResponse> GetParty(int partyId)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            
            if (party == null)
                throw new Exception("Party not found");

            return new PartyResponse
            {
                Id = party.Id,
                Name = party.Name,
                Code = party.Code,
                Members = []
            };
        }

        public async Task<List<string>> GetLobbyMembers(long partyId)
        {
            return await _partyRepository.GetLobbyMembers(partyId);
        }

        public async Task<PartyResponse?> JoinParty(long code, string username)
        {
            var party = await _partyRepository.GetPartyByCode(code);
            if (party == null) return null;
            if (party.Status != "Lobby") return null;

            var user = await _userRepository.GetByUsernameAsync(username)
                ?? throw new Exception("User not found");

            var alreadyMember = await _partyRepository.IsMemberAsync(party.Id, user.Id);
            if (!alreadyMember)
            {
                var partyGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(party.Id)
                    ?? throw new Exception("Party group not found");

                await _partyRepository.AddMemberAsync(new PartyMember
                {
                    UserId = user.Id,
                    PartyGroupId = partyGroup.Id,
                    PartyId = party.Id
                });
            }

            var members = await _partyRepository.GetLobbyMembers(party.Id);

            return new PartyResponse
            {
                Id = party.Id,
                Name = party.Name,
                Code = party.Code,
                Members = members
            };
        }

        public async Task<bool> StartGame(long partyId)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            if (party == null) return false;

            party.Status = "InGame";

            var members = await _partyRepository.GetPartyMembersWithUsersAsync(partyId);
            var shuffled = members.OrderBy(_ => Guid.NewGuid()).ToList();

            if (party.GroupSize == null)
            {
                // No groups ‚Äî everyone plays solo with both tasks
                foreach (var m in shuffled)
                    m.Role = "Explorer";
            }
            else
            {
                // Alternate Scout/Trailblazer within each group of GroupSize
                for (int i = 0; i < shuffled.Count; i++)
                    shuffled[i].Role = i % 2 == 0 ? "Scout" : "Trailblazer";
            }

            await _partyRepository.SaveChangesAsync();
            return true;
        }

        public async Task<GameStateResponse?> GetGameState(long partyId)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            if (party == null) return null;

            var members = await _partyRepository.GetPartyMembersWithUsersAsync(partyId);
            var visited = await _partyRepository.GetVisitedCheckpointsAsync(partyId);

            return new GameStateResponse
            {
                Status = party.Status,
                Members = members.Select(m => new MemberRoleDto
                {
                    Username = m.User.Username,
                    Role = m.Role
                }).ToList(),
                VisitedCheckpointIds = visited,
                GroupSize = party.GroupSize,
                BoundaryId = party.BoundaryId,
                ZoneCount = party.ZoneCount,
                CheckpointsPerZone = party.CheckpointsPerZone,
            };
        }

        public async Task VisitCheckpoint(long partyId, long checkpointId)
        {
            var party = await _partyRepository.GetPartyById(partyId) ?? throw new Exception("Party not found");
            if (party.Status != "InGame") return;
            await _partyRepository.VisitCheckpointAsync(partyId, checkpointId);
        }
    }
}ParseOptions.0.json≠
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/SensorDataService.cs≠using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services;

public class SensorDataService : ISensorDataService
{
    private readonly ISensorDataRepository _repo;

    public SensorDataService(ISensorDataRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<SensorDataResponse>> GetBySensorIdAsync(long sensorId)
    {
        var data = await _repo.GetBySensorIdAsync(sensorId);
        return data.Select(sd => new SensorDataResponse(sd.Id, sd.Light, sd.Humidity, sd.Temp, sd.Timestamp));
    }
}
ParseOptions.0.jsonÄ
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/SensorService.csÑusing Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class SensorService : ISensorService
{
    private readonly ISensorRepository _repository;
    private readonly ICheckpointService _checkpointService;

    public SensorService(ISensorRepository repository, ICheckpointService checkpointService)
    {
        _repository = repository;
        _checkpointService = checkpointService;
    }

    public async Task<Sensor> CreateAsync(CreateSensorRequest request)
    {
        var sensor = new Sensor
        {
            SensorName = request.SensorName,
            Geo = new Point(request.Longitude, request.Latitude) { SRID = 4326 }
        };
        await _repository.CreateAsync(sensor);
        await _checkpointService.CreateForSensorAsync(sensor.Id, sensor.Geo);
        return sensor;
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateSensorRequest request)
    {
        var sensor = await _repository.GetByIdAsync(id);
        if (sensor is null)
            return (false, "not_found");

        sensor.SensorName = request.SensorName;
        sensor.Geo = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        await _repository.UpdateAsync(sensor);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(long id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted)
            return (false, "not_found");
        await _checkpointService.DeleteByReferenceAsync("sensor", id);
        return (true, null);
    }
}
ParseOptions.0.json
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/UserService.csˆusing Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public UserService(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<GameLoginResponse?> LoginAsync(GameLoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null) return null;

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            return new GameLoginResponse
            {
                Token = _jwtService.Generate(user.Username, user.Role.ToString()),
                Username = user.Username,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<(GameSignUpResponse? User, string? Error)> SignUpAsync(GameSignUpRequest request)
        {
            if (await _userRepository.ExistsByEmailAsync(request.Email))
                return (null, "email_taken");

            if (await _userRepository.ExistsByUsernameAsync(request.Username))
                return (null, "username_taken");

            var user = new User
            {
                Username = request.Username,
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Role.Player
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return (new GameSignUpResponse
            {
                Token = _jwtService.Generate(user.Username, user.Role.ToString()),
                Username = user.Username,
                Name = user.Name,
                Email = user.Email
            }, null);
        }
    }
}
ParseOptions.0.json©
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Services/ZoneService.csØusing Goalz.Core.DTOs;
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
ParseOptions.0.json’
_/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/Utils/CodeGenerator.cs‹namespace Goalz.Core.Utils
{
    public static class CodeGenerator
    {
    public static long GeneratePartyCode()
    {
        var random = new Random();
        return random.NextInt64(100000, 999999);
    }
    }
}
ParseOptions.0.json˜
v/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/obj/Debug/net9.0/Goalz.Core.GlobalUsings.g.csÁ// <auto-generated/>
global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Net.Http;
global using System.Threading;
global using System.Threading.Tasks;
ParseOptions.0.jsonÂ
à/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/obj/Debug/net9.0/.NETCoreApp,Version=v9.0.AssemblyAttributes.cs¬// <autogenerated />
using System;
using System.Reflection;
[assembly: global::System.Runtime.Versioning.TargetFrameworkAttribute(".NETCoreApp,Version=v9.0", FrameworkDisplayName = ".NET 9.0")]
ParseOptions.0.jsonÊ
t/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Application/obj/Debug/net9.0/Goalz.Core.AssemblyInfo.csÿ//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: System.Reflection.AssemblyCompanyAttribute("Goalz.Core")]
[assembly: System.Reflection.AssemblyConfigurationAttribute("Debug")]
[assembly: System.Reflection.AssemblyFileVersionAttribute("1.0.0.0")]
[assembly: System.Reflection.AssemblyInformationalVersionAttribute("1.0.0+386b1377d4b3d9193b1660fe8debbcb244aea640")]
[assembly: System.Reflection.AssemblyProductAttribute("Goalz.Core")]
[assembly: System.Reflection.AssemblyTitleAttribute("Goalz.Core")]
[assembly: System.Reflection.AssemblyVersionAttribute("1.0.0.0")]

// Von der MSBuild WriteCodeFragment-Klasse generiert.

ParseOptions.0.json