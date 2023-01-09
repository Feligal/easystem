using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
using EASystem.Models.ViewModels;
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
        Task<IEnumerable<Exam>> GetExamsByDepartmentId(int departmentId);
        Task<IEnumerable<ExamTaken>> PendingExamsByClientId(int id);
        Task<IEnumerable<ExamTaken>> TakenExamsByUserId(string userId);
        Task<IEnumerable<ExamTaken>> PendingExamsByUserId(string userId);
        Task<IEnumerable<ExamTaken>> TakenExamsByClientId(int id);
        Task<IEnumerable<ExamTaken>> GetPendingWrittenExams();
        Task<IEnumerable<ExamTaken>> GetPendingWrittenExamsByDepartmentId(int departmentId);
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
        Task<IEnumerable<Question>> GetQuestionByQText(string qText);
        Task<IEnumerable<Report>> GetExamRecords(int examId);
        Task<IEnumerable<Report>> GetExamRecordsByDepatmentId(int examId, int departmentId);
        Task<Report> GetExamRecord(int Id);
        Task<IEnumerable<ExamTaken>> GetExamPendingActive(string examName);
        Task<IEnumerable<ExamTaken>> GetExamPendingActiveByDepartmentId(string examName, int departmentId);
        Task<IEnumerable<Report>> GetExamsReportsByName(string examName);
        Task<IEnumerable<Report>> GetFilteredExamsReportsByName(DateTime startDate, DateTime endDate, string examName);
        Task<ExamTaken> GetExamToActivate(int id);
        Task<IEnumerable<Report>> GetAllExamRecords();
        Task<IEnumerable<Report>> GetAllExamRecordsByDepartmentId(int departmentId);
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
        Task<IEnumerable<AppUser>> GetAllAdminUsersByDepartmentId(UserManager<AppUser> userManager,int departmentId);
        Task<IEnumerable<AppUser>> GetAllAdminUsersNoDepartment(UserManager<AppUser> userManager);
        Task<IEnumerable<AppUser>> GetAllUsers(UserManager<AppUser> userManager);
        Task<IdentityRole> GetRoleByName(string roleName, RoleManager<IdentityRole> roleManager);
        Task<IEnumerable<IdentityRole>> GetUserRoles(RoleManager<IdentityRole> roleManager);
        Task<IdentityRole> CreateRole(string roleName, RoleManager<IdentityRole> roleManager);
        Task<IdentityRole> DeleteRole(string id, RoleManager<IdentityRole> roleManager);
        Task<IdentityRole> GetRole(string id, RoleManager<IdentityRole> roleManager);
        Task<IEnumerable<AppUser>> GetAllClientUsers(UserManager<AppUser> userManager);
        Task<AppUser> GetAdminUserWithProfile(string id, UserManager<AppUser> userManager);
        Task<AppUser> GetClientUserWithProfile(string id, UserManager<AppUser> userManager);
        Task<AppUser> GetClientUserWithProfileByUsername(string username, UserManager<AppUser> userManager);
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

        Task<IEnumerable<CompanyInfo>> GetCompanyInfos();
        void AddCompanyInfos(CompanyInfo companyInfo);



        //Notification Methods
        Task<IEnumerable<Notification>> GetNotifications();
        void AddNotification(Notification notification);
        Task<Notification> GetNotificationById(int id);
        void RemoveNotification(Notification notification);
        void RemoveMultipleNotifications(List<Notification> notifications);
        Task<IEnumerable<Notification>> GetNotificationsByView(bool isOpened);
        //Departments
        void AddDepartment(Department department);
        Task<IEnumerable<Department>> GetDepartments();
        Task<Department> GetDepartment(int departmentId);
        Task<Department> GetDepartmentWithUsers(int departmentId);
        void DeleteDepartment(Department department);

        //Document Attachment 
        void AddDocumentAttachement(ClientUploadedImage attachment);
        void RemoveDocumentAttachement(ClientUploadedImage attachment);
        Task<IEnumerable<ClientUploadedImage>> GetClientUploadedImages(int clientProfileId);

        Task<ClientUploadedImage> GetClientUploadImage(string fileName);
    }
}
