using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class AddedPhoneAndEmailToReport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                table: "ExamReports",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserPhoneNumber",
                table: "ExamReports",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserEmail",
                table: "ExamReports");

            migrationBuilder.DropColumn(
                name: "UserPhoneNumber",
                table: "ExamReports");
        }
    }
}
