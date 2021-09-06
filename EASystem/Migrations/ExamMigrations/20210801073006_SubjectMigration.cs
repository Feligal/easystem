using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class SubjectMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Title",
                table: "ClientApplications");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Applications");

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "ClientApplications",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Subject",
                table: "Applications",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Subject",
                table: "ClientApplications");

            migrationBuilder.DropColumn(
                name: "Subject",
                table: "Applications");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "ClientApplications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Applications",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
