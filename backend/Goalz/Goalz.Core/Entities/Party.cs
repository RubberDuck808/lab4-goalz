using System.ComponentModel.DataAnnotations.Schema;

namespace Goalz.Core.Entities
{
    [Table("Parties")]
    public class Party {
        public long Id { get; set; }
        public long QuizId { get; set; }
        public string Name { get; set; }
        public long Code { get; set; }
        public virtual ICollection<PartyGroup> PartyGroups {get; set;} = [];
    }
}
