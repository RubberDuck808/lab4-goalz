using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAiClassificationAndAnalysedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiClassification",
                table: "Elements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AnalysedAt",
                table: "Elements",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiClassification",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "AnalysedAt",
                table: "Elements");
        }
    }
}
