using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPartyGameConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BoundaryZoneId",
                table: "Parties",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CheckpointsPerZone",
                table: "Parties",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GroupSize",
                table: "Parties",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ZoneCount",
                table: "Parties",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BoundaryZoneId",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "CheckpointsPerZone",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "GroupSize",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ZoneCount",
                table: "Parties");
        }
    }
}
