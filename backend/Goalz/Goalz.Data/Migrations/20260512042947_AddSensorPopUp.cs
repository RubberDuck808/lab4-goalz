using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSensorPopUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "PopUpId",
                table: "Sensors",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PopUps",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InfoText = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PopUps", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sensors_PopUpId",
                table: "Sensors",
                column: "PopUpId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Sensors_PopUps_PopUpId",
                table: "Sensors",
                column: "PopUpId",
                principalTable: "PopUps",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sensors_PopUps_PopUpId",
                table: "Sensors");

            migrationBuilder.DropTable(
                name: "PopUps");

            migrationBuilder.DropIndex(
                name: "IX_Sensors_PopUpId",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "PopUpId",
                table: "Sensors");
        }
    }
}
