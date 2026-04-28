using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(Goalz.Data.Storage.AppDbContext))]
    [Migration("20260427200000_SeparateBoundaryFromZone")]
    public partial class SeparateBoundaryFromZone : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create Boundaries table
            migrationBuilder.CreateTable(
                name: "Boundaries",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Geometry = table.Column<Geometry>(type: "geometry", nullable: false),
                },
                constraints: table => table.PrimaryKey("PK_Boundaries", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "IX_Boundaries_Geometry",
                table: "Boundaries",
                column: "Geometry")
                .Annotation("Npgsql:IndexMethod", "gist");

            // 2. Copy existing boundary zones into Boundaries (preserving IDs)
            migrationBuilder.Sql("""
                INSERT INTO "Boundaries" ("Id", "Name", "Color", "Geometry")
                SELECT "Id", "Name", "Color", "Boundary"
                FROM "Zones"
                WHERE "ZoneType" = 'boundary';
                """);

            // 3. Reset identity sequence to avoid future collisions
            migrationBuilder.Sql("""
                SELECT setval(
                    pg_get_serial_sequence('"Boundaries"', 'Id'),
                    COALESCE((SELECT MAX("Id") FROM "Boundaries"), 0) + 1,
                    false
                );
                """);

            // 4. Add BoundaryId to Parties
            migrationBuilder.AddColumn<long>(
                name: "BoundaryId",
                table: "Parties",
                type: "bigint",
                nullable: true);

            // 5. Populate BoundaryId from BoundaryZoneId (IDs are identical after the INSERT above)
            migrationBuilder.Sql("""
                UPDATE "Parties" SET "BoundaryId" = "BoundaryZoneId";
                """);

            // 6. Drop old BoundaryZoneId column
            migrationBuilder.DropColumn(name: "BoundaryZoneId", table: "Parties");

            // 7. Clear ZoneId on checkpoints that pointed at a boundary zone
            migrationBuilder.Sql("""
                UPDATE "Checkpoints" SET "ZoneId" = NULL
                WHERE "ZoneId" IN (SELECT "Id" FROM "Zones" WHERE "ZoneType" = 'boundary');
                """);

            // 8. Remove boundary rows from Zones table
            migrationBuilder.Sql("""
                DELETE FROM "Zones" WHERE "ZoneType" = 'boundary';
                """);

            // 9. Drop the unused Sections table
            migrationBuilder.DropTable(name: "Sections");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate Sections table
            migrationBuilder.CreateTable(
                name: "Sections",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ZoneId = table.Column<long>(type: "bigint", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    CompletionCriteria = table.Column<string>(type: "text", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sections", x => x.Id);
                    table.ForeignKey("FK_Sections_Zones_ZoneId", x => x.ZoneId, "Zones", "Id", onDelete: ReferentialAction.Cascade);
                });

            // Restore BoundaryZoneId on Parties
            migrationBuilder.AddColumn<long>(
                name: "BoundaryZoneId",
                table: "Parties",
                type: "bigint",
                nullable: true);

            // Restore boundary zones from Boundaries back into Zones
            migrationBuilder.Sql("""
                INSERT INTO "Zones" ("Id", "Name", "ZoneType", "Color", "Boundary")
                SELECT "Id", "Name", 'boundary', "Color", "Geometry"
                FROM "Boundaries";
                """);

            migrationBuilder.Sql("""
                UPDATE "Parties" SET "BoundaryZoneId" = "BoundaryId";
                """);

            migrationBuilder.DropColumn(name: "BoundaryId", table: "Parties");

            migrationBuilder.DropTable(name: "Boundaries");
        }
    }
}
