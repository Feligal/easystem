using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
using EASystem.Models.ViewModels;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Persistence
{
    public class AppDbContext:IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<AppUser>()
                .HasOne(a => a.AdminUserProfile)
                .WithOne(u => u.AppUser)
                .OnDelete(DeleteBehavior.ClientCascade);

            builder.Entity<AppUser>()
                .HasOne(c => c.ClientUserProfile)
                .WithOne(d => d.AppUser)
                .OnDelete(DeleteBehavior.ClientCascade);

            builder.Entity<AppUser>().HasMany(u => u.Tokens).WithOne(i => i.User);
            builder.Entity<Token>().ToTable("Tokens");
            builder.Entity<Token>().Property(i => i.Id).ValueGeneratedOnAdd();
            builder.Entity<Token>().HasOne(i => i.User).WithMany(u => u.Tokens);
            base.OnModelCreating(builder);
        }
        public DbSet<Exam> Exams { get; set; }        
        public DbSet<ExamTaken> ExamsTaken { get; set; }
        public DbSet<Token> Tokens { get; set; }        
        public DbSet<ClientUserProfile> ClientUserProfile { get; set; }
        public DbSet<AdminUserProfile> AdminUserProfile { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Log> Logs { get; set; }
        public DbSet<Report> ExamReports { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<ClientApplication> ClientApplications { get; set; }
        public DbSet<ExamReview> ExamReviews { get; set; }
        public DbSet<CompanyInfo> CompanyInfos { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<ClientUploadedImage> ClientUploadedImages { get; set; }


    }
}
