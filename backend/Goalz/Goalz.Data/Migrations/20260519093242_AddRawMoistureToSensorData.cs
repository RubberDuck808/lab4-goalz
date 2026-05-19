using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRawMoistureToSensorData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SoilMoisture and Wind already exist in the database; only RawMoisture is new.
            migrationBuilder.AddColumn<int>(
                name: "RawMoisture",
                table: "SensorData",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RawMoisture",
                table: "SensorData");
        }
    }
}
