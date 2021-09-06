using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class ExamReview : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamReviews",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamTakenId = table.Column<int>(nullable: false),
                    QuestionId = table.Column<int>(nullable: false),
                    SelectedAnswer = table.Column<string>(nullable: true),
                    DateTaken = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamReviews_ExamTaken_ExamTakenId",
                        column: x => x.ExamTakenId,
                        principalTable: "ExamTaken",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Questions_ExamId",
                table: "Questions",
                column: "ExamId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamReviews_ExamTakenId",
                table: "ExamReviews",
                column: "ExamTakenId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Exams_ExamId",
                table: "Questions",
                column: "ExamId",
                principalTable: "Exams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Exams_ExamId",
                table: "Questions");

            migrationBuilder.DropTable(
                name: "ExamReviews");

            migrationBuilder.DropIndex(
                name: "IX_Questions_ExamId",
                table: "Questions");
        }
    }
}
