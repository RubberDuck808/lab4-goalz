using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddScoreToPartyMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Score",
                table: "PartyMembers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Score",
                table: "PartyMembers");
        }
    }
}
