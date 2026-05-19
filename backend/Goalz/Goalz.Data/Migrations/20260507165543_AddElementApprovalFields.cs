using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddElementApprovalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Elements",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Elements",
                type: "boolean",
                nullable: false,
                defaultValue: true);   // existing rows are approved

            migrationBuilder.AddColumn<string>(
                name: "SubmittedBy",
                table: "Elements",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Elements_IsApproved",
                table: "Elements",
                column: "IsApproved");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Elements_IsApproved",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Elements");

            migrationBuilder.DropColumn(
                name: "SubmittedBy",
                table: "Elements");
        }
    }
}
