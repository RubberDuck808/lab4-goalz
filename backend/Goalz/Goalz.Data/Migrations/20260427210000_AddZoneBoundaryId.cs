using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(Goalz.Data.Storage.AppDbContext))]
    [Migration("20260427210000_AddZoneBoundaryId")]
    public partial class AddZoneBoundaryId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BoundaryId",
                table: "Zones",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Zones_BoundaryId",
                table: "Zones",
                column: "BoundaryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Zones_Boundaries_BoundaryId",
                table: "Zones",
                column: "BoundaryId",
                principalTable: "Boundaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Zones_Boundaries_BoundaryId",
                table: "Zones");

            migrationBuilder.DropIndex(
                name: "IX_Zones_BoundaryId",
                table: "Zones");

            migrationBuilder.DropColumn(
                name: "BoundaryId",
                table: "Zones");
        }
    }
}
