using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Persistence
{
    public interface IAppRepository
    {
        Task<IEnumerable<Exam>> GetExams();
        Task<IEnumerable<ExamTaken>> PendingExamsByClientId(int id);
        Task<IEnumerable<ExamTaken>> TakenExamsByUserId(string userId);
        Task<IEnumerable<ExamTaken>> PendingExamsByUserId(string userId);
        Task<IEnumerable<ExamTaken>> TakenExamsByClientId(int id);
        Task<ExamTaken> GetWrittenExam(int examId);
        Task<Exam> GetExam(int examId);
        Task<Exam> GetExamWithQuestion(int examId);
        void DeleteExam(Exam exam);
        void DeleteExamRecord(Report report);
        void AddExam(Exam exam);
        void CancelExam(ExamTaken exam);
        void AddQuestion(Question question);
        void RemoveQuestion(Question question);
        Task<IEnumerable<Question>> GetQuestionsByExamId(int examId);
        Task<Question> GetQuestionById(int questionId);
        Task<IEnumerable<Report>> GetExamRecords(int examId);
        Task<Report> GetExamRecord(int Id);
        Task<IEnumerable<Report>> GetAllExamRecords();
        Task<IEnumerable<ExamReview>> GetExamReviews(int id);
        void AddClientApplication(ClientApplication application);
        void AddApplication(Application application);
        Task<IEnumerable<ClientApplication>> GetClientApplications(string userId);
        Task<IEnumerable<Application>> GetApplications();
        void RemoveClientApplication(ClientApplication application);
        void RemoveApplication(Application application);
        Task<ClientApplication> GetClientApplication(int id);
        Task<Application> GetApplication(int id);


        //ADMINISTRATIVE FUNCTIONS
        Task<IEnumerable<AppUser>> GetAllAdminUsers(UserManager<AppUser> userManager);
        Task<IEnumerable<AppUser>> GetAllUsers(UserManager<AppUser> userManager);
        Task<IdentityRole> GetRoleByName(string roleName, RoleManager<IdentityRole> roleManager);
        Task<IEnumerable<IdentityRole>> GetUserRoles(RoleManager<IdentityRole> roleManager);
        Task<IdentityRole> CreateRole(string roleName, RoleManager<IdentityRole> roleManager);
        Task<IdentityRole> DeleteRole(string id, RoleManager<IdentityRole> roleManager);
        Task<IdentityRole> GetRole(string id, RoleManager<IdentityRole> roleManager);
        Task<IEnumerable<AppUser>> GetAllClientUsers(UserManager<AppUser> userManager);
        Task<AppUser> GetAdminUserWithProfile(string id, UserManager<AppUser> userManager);
        Task<AppUser> GetClientUserWithProfile(string id, UserManager<AppUser> userManager);
        Task<AppUser> GetIdentityUser(string id, UserManager<AppUser> userManager);
        Task<AppUser> GetUserWithProfileData(string id, UserManager<AppUser> userManager);
        //Log Implementaion
        Task<IEnumerable<Log>> GetLogs();
        void AddLog(Log log);
        Task<Log> GetLogByDate(DateTime date);
        Task<Log> GetLogById(int id);
        void RemoveLog(Log log);
        Task<IEnumerable<Log>> GetLogsBetweenDates(DateTime firstDate, DateTime secondDate);
        Task<AppUser> GetClientUserByUserId(string userId, UserManager<AppUser> userManager);
        void DeleteClientUserProfile(ClientUserProfile profile);

    }
}
