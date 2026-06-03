using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddElementSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "Wind",
                table: "SensorData",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision");

            migrationBuilder.AlterColumn<int>(
                name: "SoilMoisture",
                table: "SensorData",
                type: "integer",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<float>(
                name: "AiConfidence",
                table: "Elements",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiResult",
                table: "Elements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiSummary",
                table: "Elements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRejected",
                table: "Elements",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiConfidence",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "AiResult",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "AiSummary",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "IsRejected",
                table: "Elements");

            migrationBuilder.AlterColumn<double>(
                name: "Wind",
                table: "SensorData",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "SoilMoisture",
                table: "SensorData",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
