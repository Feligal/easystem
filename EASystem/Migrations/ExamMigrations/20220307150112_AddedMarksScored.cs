using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class AddedMarksScored : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "Score",
                table: "ExamTaken",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "MarksScored",
                table: "ExamTaken",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MarksScored",
                table: "ExamReports",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MarksScored",
                table: "ExamTaken");

            migrationBuilder.DropColumn(
                name: "MarksScored",
                table: "ExamReports");

            migrationBuilder.AlterColumn<int>(
                name: "Score",
                table: "ExamTaken",
                type: "int",
                nullable: false,
                oldClrType: typeof(double));
        }
    }
}
