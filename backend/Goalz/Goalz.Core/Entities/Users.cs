    using System.ComponentModel.DataAnnotations.Schema;

    namespace Goalz.Core.Entities
    {
        [Table("Users")] // Tells EF to look for the "Users" table (capital U)
        public class User
        {
            public long Id { get; set; } // BIGINT in SQL = long in C#
            public string Name { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Username {  get; set; } = string.Empty;
            public string PasswordHash { get; set; } = string.Empty;
        }
    }