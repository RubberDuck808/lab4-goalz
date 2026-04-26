using System.ComponentModel.DataAnnotations.Schema;

namespace Goalz.Core.Entities
{
    [Table("PartyMembers")]
    public class PartyMember
    {
        public long Id {set; get;}
        public long PartyGroupId {set; get;}
        public long UserId {set; get;}
        public virtual PartyGroup PartyGroup { get; set; }
        public virtual User User { get; set; }
        
    }
}