using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class AddedPassMarkPercentages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PassMarkPercentage",
                table: "ExamReports",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PassMarkPercentage",
                table: "ExamReports");
        }
    }
}
