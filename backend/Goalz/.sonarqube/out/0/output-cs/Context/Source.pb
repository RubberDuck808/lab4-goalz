⁄
V/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Answer.csÍnamespace Goalz.Domain.Entities;

public class Answer
{
    public long Id { get; set; }
    public long QuestionId { get; set; }
    public string AnswerTxt { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }

    public Question Question { get; set; } = null!;
    public ICollection<PartyGroupAnswer> PartyGroupAnswers { get; set; } = [];
}
ParseOptions.0.jsonè
X/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Boundary.csùusing NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Boundary
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#1A5C2E";
    public Geometry Geometry { get; set; } = null!;
}
ParseOptions.0.jsonÍ
Z/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Checkpoint.csˆusing NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Checkpoint
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;  // "sensor" | "element"
    public long ReferenceId { get; set; }
    public Point Location { get; set; } = null!;
    public long? ZoneId { get; set; }
    public Zone? Zone { get; set; }
}
ParseOptions.0.jsoné
W/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Element.csùusing NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Element
{
    public long Id { get; set; }
    public string ElementName { get; set; } = string.Empty;
    public int ElementTypeId { get; set; }
    public ElementType ElementType { get; set; } = null!;
    public Point Geom { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public bool IsGreen { get; set; }
}ParseOptions.0.jsonˇ
[/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/ElementType.csäusing System.Text.Json.Serialization;

namespace Goalz.Domain.Entities;

public class ElementType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Element> Elements { get; set; } = [];
}
ParseOptions.0.json∆
Z/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Friendship.cs“namespace Goalz.Domain.Entities;

public class Friendship
{
    public long Id { get; set; }

    public long RequesterId { get; set; }
    public User Requester { get; set; } = null!;

    public long AddresseeId { get; set; }
    public User Addressee { get; set; } = null!;

    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
ParseOptions.0.json÷
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/FriendshipStatus.cs]namespace Goalz.Domain.Entities;

public enum FriendshipStatus
{
    Pending,
    Accepted
}
ParseOptions.0.jsonÓ
[/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Information.cs˘namespace Goalz.Domain.Entities;

public class Information
{
    public long Id { get; set; }
    public long InfoTxt { get; set; }
    public long NewColumn { get; set; }

    public ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
}ParseOptions.0.jsonö
U/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Party.cs´namespace Goalz.Domain.Entities;

public class Party
{
    public long Id { get; set; }
    public long? QuizId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Lobby";
    public long Code { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Game configuration set by host before starting
    public int? GroupSize { get; set; }          // null = no groups (Explorer role)
    public long? BoundaryId { get; set; }         // which boundary to play in
    public int? ZoneCount { get; set; }          // how many sub-zones to include
    public int? CheckpointsPerZone { get; set; } // max checkpoints per zone

    public Quiz? Quiz { get; set; }
    public ICollection<PartyGroup> PartyGroups { get; set; } = [];
}
ParseOptions.0.jsonÒ
Z/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/PartyGroup.cs˝namespace Goalz.Domain.Entities;

public class PartyGroup
{
    public long Id { get; set; }
    public long PartyId { get; set; }
    public string Name { get; set; } = string.Empty;

    public Party Party { get; set; } = null!;
    public ICollection<PartyMember> PartyMembers { get; set; } = [];
    public ICollection<PartyGroupAnswer> PartyGroupAnswers { get; set; } = [];
}
ParseOptions.0.json«
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/PartyGroupAnswer.csÕnamespace Goalz.Domain.Entities;

public class PartyGroupAnswer
{
    public long Id { get; set; }
    public long PartyGroupId { get; set; }
    public long AnswerId { get; set; }
    public long ReceivedPoints { get; set; }

    public PartyGroup PartyGroup { get; set; } = null!;
    public Answer Answer { get; set; } = null!;
}
ParseOptions.0.json÷
[/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/PartyMember.cs·namespace Goalz.Domain.Entities;

public class PartyMember
{
    public long Id { get; set; }
    public long PartyGroupId { get; set; }
    public long UserId { get; set; }
    public string? Role { get; set; }

    public PartyGroup PartyGroup { get; set; } = null!;
    public User User { get; set; } = null!;
    public long PartyId { get; set; }
}
ParseOptions.0.json¢
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/PartyVisitedCheckpoint.cs¢namespace Goalz.Domain.Entities;

public class PartyVisitedCheckpoint
{
    public long Id { get; set; }
    public long PartyId { get; set; }
    public Party Party { get; set; } = null!;
    public long CheckpointId { get; set; }
    public Checkpoint Checkpoint { get; set; } = null!;
}
ParseOptions.0.jsonò
X/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Question.cs¶namespace Goalz.Domain.Entities;

public class Question
{
    public long Id { get; set; }
    public long QuizId { get; set; }
    public string QuestionTxt { get; set; } = string.Empty;

    public Quiz Quiz { get; set; } = null!;
    public ICollection<Answer> Answers { get; set; } = [];
}
ParseOptions.0.json¿
T/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Quiz.cs“namespace Goalz.Domain.Entities;

public class Quiz
{
    public long Id { get; set; }
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<Party> Parties { get; set; } = [];
}
ParseOptions.0.json≈
T/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Role.csXnamespace Goalz.Domain.Entities;

public enum Role
{
    Player,
    Staff,
    Admin
}
ParseOptions.0.jsonø
V/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Sensor.csœusing NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Sensor
{
    public long Id { get; set; }
    public string? SensorName { get; set; }
    public Point? Geo { get; set; }
}
ParseOptions.0.json»
Z/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/SensorData.cs‘namespace Goalz.Domain.Entities;

public class SensorData
{
    public long Id { get; set; }
    public long SensorsId { get; set; }
    public long Light { get; set; }
    public long Humidity { get; set; }
    public double Temp { get; set; }
    public DateTime Timestamp { get; set; }

    public Sensor Sensor { get; set; } = null!;
}
ParseOptions.0.jsonÒ
T/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/User.csÉnamespace Goalz.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.Player;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PartyMember> PartyMembers { get; set; } = [];
    public ICollection<Friendship> SentFriendships { get; set; } = [];
    public ICollection<Friendship> ReceivedFriendships { get; set; } = [];
}
ParseOptions.0.json±
T/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Entities/Zone.cs√using NetTopologySuite.Geometries;

namespace Goalz.Domain.Entities;

public class Zone
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#33A661";
    public long? BoundaryId { get; set; }
    public Geometry Boundary { get; set; } = null!;
}
ParseOptions.0.jsonã
]/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/Interfaces/IRepository.csînamespace Goalz.Domain.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(long id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task SaveChangesAsync();
}
ParseOptions.0.jsonÙ
s/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/obj/Debug/net9.0/Goalz.Domain.GlobalUsings.g.csÁ// <auto-generated/>
global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Net.Http;
global using System.Threading;
global using System.Threading.Tasks;
ParseOptions.0.json‡
É/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/obj/Debug/net9.0/.NETCoreApp,Version=v9.0.AssemblyAttributes.cs¬// <autogenerated />
using System;
using System.Reflection;
[assembly: global::System.Runtime.Versioning.TargetFrameworkAttribute(".NETCoreApp,Version=v9.0", FrameworkDisplayName = ".NET 9.0")]
ParseOptions.0.jsonÁ
q/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Domain/obj/Debug/net9.0/Goalz.Domain.AssemblyInfo.cs‹//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: System.Reflection.AssemblyCompanyAttribute("Goalz.Domain")]
[assembly: System.Reflection.AssemblyConfigurationAttribute("Debug")]
[assembly: System.Reflection.AssemblyFileVersionAttribute("1.0.0.0")]
[assembly: System.Reflection.AssemblyInformationalVersionAttribute("1.0.0+386b1377d4b3d9193b1660fe8debbcb244aea640")]
[assembly: System.Reflection.AssemblyProductAttribute("Goalz.Domain")]
[assembly: System.Reflection.AssemblyTitleAttribute("Goalz.Domain")]
[assembly: System.Reflection.AssemblyVersionAttribute("1.0.0.0")]

// Generated by the MSBuild WriteCodeFragment class.

ParseOptions.0.json