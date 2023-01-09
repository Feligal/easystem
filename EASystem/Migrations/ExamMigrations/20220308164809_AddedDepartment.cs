using Microsoft.EntityFrameworkCore.Migrations;

namespace EASystem.Migrations.ExamMigrations
{
    public partial class AddedDepartment : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "Exams",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "AdminUserProfile",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exams_DepartmentId",
                table: "Exams",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AdminUserProfile_DepartmentId",
                table: "AdminUserProfile",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AdminUserProfile_Departments_DepartmentId",
                table: "AdminUserProfile",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_Departments_DepartmentId",
                table: "Exams",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AdminUserProfile_Departments_DepartmentId",
                table: "AdminUserProfile");

            migrationBuilder.DropForeignKey(
                name: "FK_Exams_Departments_DepartmentId",
                table: "Exams");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Exams_DepartmentId",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_AdminUserProfile_DepartmentId",
                table: "AdminUserProfile");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "AdminUserProfile");
        }
    }
}
