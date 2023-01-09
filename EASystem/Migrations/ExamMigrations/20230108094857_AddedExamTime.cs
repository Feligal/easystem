using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class AddedExamTime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "ExamTaken",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExamTime",
                table: "ExamTaken",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TimeFinished",
                table: "ExamTaken",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "TimeStarted",
                table: "ExamTaken",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "TimeTakenToWrite",
                table: "ExamTaken",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "ExamTaken");

            migrationBuilder.DropColumn(
                name: "ExamTime",
                table: "ExamTaken");

            migrationBuilder.DropColumn(
                name: "TimeFinished",
                table: "ExamTaken");

            migrationBuilder.DropColumn(
                name: "TimeStarted",
                table: "ExamTaken");

            migrationBuilder.DropColumn(
                name: "TimeTakenToWrite",
                table: "ExamTaken");
        }
    }
}
