using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(Goalz.Data.Storage.AppDbContext))]
    [Migration("20260427220000_DropZoneType")]
    public partial class DropZoneType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ZoneType", table: "Zones");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ZoneType",
                table: "Zones",
                type: "text",
                nullable: false,
                defaultValue: "area");
        }
    }
}
