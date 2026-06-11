using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AlterCheckpointRedesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Checkpoints_Sections_SectionId",
                table: "Checkpoints");

            migrationBuilder.DropIndex(
                name: "IX_Checkpoints_SectionId",
                table: "Checkpoints");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Checkpoints");

            migrationBuilder.RenameColumn(
                name: "SectionId",
                table: "Checkpoints",
                newName: "ReferenceId");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Checkpoints",
                newName: "Type");

            migrationBuilder.AddColumn<long>(
                name: "ZoneId",
                table: "Checkpoints",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_Type_ReferenceId",
                table: "Checkpoints",
                columns: new[] { "Type", "ReferenceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_ZoneId",
                table: "Checkpoints",
                column: "ZoneId");

            migrationBuilder.AddForeignKey(
                name: "FK_Checkpoints_Zones_ZoneId",
                table: "Checkpoints",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Checkpoints_Zones_ZoneId",
                table: "Checkpoints");

            migrationBuilder.DropIndex(
                name: "IX_Checkpoints_Type_ReferenceId",
                table: "Checkpoints");

            migrationBuilder.DropIndex(
                name: "IX_Checkpoints_ZoneId",
                table: "Checkpoints");

            migrationBuilder.DropColumn(
                name: "ZoneId",
                table: "Checkpoints");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Checkpoints",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "ReferenceId",
                table: "Checkpoints",
                newName: "SectionId");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Checkpoints",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_SectionId",
                table: "Checkpoints",
                column: "SectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Checkpoints_Sections_SectionId",
                table: "Checkpoints",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
