using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SensorData_SensorsId_Timestamp",
                table: "SensorData",
                columns: new[] { "SensorsId", "Timestamp" },
                descending: new[] { false, true });

            migrationBuilder.DropIndex(
                name: "IX_Elements_IsApproved",
                table: "Elements");

            migrationBuilder.CreateIndex(
                name: "IX_Elements_IsApproved",
                table: "Elements",
                column: "IsApproved",
                filter: "\"IsApproved\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SensorData_SensorsId_Timestamp",
                table: "SensorData");

            migrationBuilder.DropIndex(
                name: "IX_Elements_IsApproved",
                table: "Elements");

            migrationBuilder.CreateIndex(
                name: "IX_Elements_IsApproved",
                table: "Elements",
                column: "IsApproved");
        }
    }
}
