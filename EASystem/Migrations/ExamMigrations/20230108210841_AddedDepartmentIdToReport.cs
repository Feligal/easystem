using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class AddedDepartmentIdToReport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "ExamReports",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "ExamReports");
        }
    }
}
