using System.ComponentModel.DataAnnotations.Schema;

namespace Goalz.Core.Entities
{
    [Table("PartyGroups")]
    public class PartyGroup
    {
        public long Id {get; set;}
        public long PartyId {get; set;}
        public string Name {get; set;}
        public virtual Party Party { get; set; }
        public virtual ICollection<PartyMember> PartyMembers { get; set; } = [];

    }
}