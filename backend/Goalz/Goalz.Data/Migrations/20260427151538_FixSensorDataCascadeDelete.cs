using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixSensorDataCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""SensorData""
                    DROP CONSTRAINT IF EXISTS ""fk_sensordata_sensors"";

                ALTER TABLE ""SensorData""
                    ADD CONSTRAINT ""fk_sensordata_sensors""
                    FOREIGN KEY (""SensorsId"")
                    REFERENCES ""Sensors""(""Id"")
                    ON DELETE CASCADE;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""SensorData""
                    DROP CONSTRAINT IF EXISTS ""fk_sensordata_sensors"";

                ALTER TABLE ""SensorData""
                    ADD CONSTRAINT ""fk_sensordata_sensors""
                    FOREIGN KEY (""SensorsId"")
                    REFERENCES ""Sensors""(""Id"");
            ");
        }
    }
}
