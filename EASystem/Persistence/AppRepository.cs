using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
using EASystem.Models.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Persistence
{
    public class AppRepository: IAppRepository
    {
        private AppDbContext _dbContext;
        public AppRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Exam>> GetExams() {
            return await _dbContext.Exams
                .OrderBy(x => x.Name)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Exam>> GetExamsByDepartmentId(int departmentId) {
            return await _dbContext.Exams.Where(x=>x.DepartmentId == departmentId)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }
        public async Task<IEnumerable<Report>> GetExamRecords(int examId) {
            return await _dbContext.ExamReports
                .OrderByDescending(x => x.DateTaken)
                .Where(x => x.ExamId == examId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetExamRecordsByDepatmentId(int examId, int departmentId)
        {
            return await _dbContext.ExamReports
                .OrderByDescending(x => x.DateTaken)
                .Where(x => x.ExamId == examId && x.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetAllExamRecords() {
            return await _dbContext.ExamReports
               .OrderByDescending(x => x.DateTaken)               
               .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetAllExamRecordsByDepartmentId(int departmentId)
        {
            return await _dbContext.ExamReports
               .Where(x=>x.DepartmentId == departmentId)
               .OrderByDescending(x => x.DateTaken)
               .ToListAsync();
        }


        public async Task<IEnumerable<ExamReview>> GetExamReviews(int id)
        {
            return await _dbContext.ExamReviews
                .Where(x=>x.ExamTakenId == id)
                .OrderBy(x => x.Id)
                .ToListAsync();
        }

        public async Task<Exam> GetExam(int examId) {
            return await _dbContext.Exams
            .SingleOrDefaultAsync(e => e.Id == examId);            
        }

        public async Task<Exam> GetExamWithQuestion(int examId) {
            return await _dbContext.Exams.Include(q=>q.Questions)
            .SingleOrDefaultAsync(e => e.Id == examId);
        }

        public async Task<ExamTaken> GetWrittenExam(int id) {
            return await _dbContext.ExamsTaken
                .Include(x=>x.ExamReviews)
                .SingleOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<ExamTaken>> GetPendingWrittenExams()
        {
            return await _dbContext.ExamsTaken
                .Where(x => x.IsActivated == false || x.PassStatus=="Pending")
                .ToListAsync();                                
        }

        public async Task<IEnumerable<ExamTaken>> GetPendingWrittenExamsByDepartmentId(int departmentId)
        {
            return await _dbContext.ExamsTaken
                .Where(x => (x.IsActivated == false || x.PassStatus == "Pending") &&  x.DepartmentId == departmentId )
                .ToListAsync();
        }

        public void AddExam(Exam exam) {
            _dbContext.Add(exam);
        }
        public void DeleteExam(Exam exam) {
            _dbContext.Remove(exam);
        }

        public void CancelExam(ExamTaken exam) {
            _dbContext.Remove(exam);
        }

        public void DeleteExamRecord(Report report) {
            _dbContext.Remove(report);
        }

        public async Task<ExamTaken> GetExamToActivate(int id) {
            return await _dbContext.ExamsTaken
                 .SingleOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Report> GetExamRecord(int Id) {
            return await _dbContext.ExamReports
                .SingleOrDefaultAsync(s => s.Id == Id);
        }

        public async Task<IEnumerable<ExamTaken>> GetExamPendingActive(string examName) {
            return await _dbContext.ExamsTaken
                .OrderByDescending(x => x.Id)
                .Where(x => (x.IsActivated == false || x.PassStatus == "Pending")&& x.Name == examName)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamTaken>> GetExamPendingActiveByDepartmentId(string examName, int departmentId)
        {
            return await _dbContext.ExamsTaken
                .OrderByDescending(x => x.Id)
                .Where(x => (x.IsActivated == false || x.PassStatus == "Pending") && x.Name == examName && x.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetExamsReportsByName(string examName) {
            return await _dbContext.ExamReports
                .OrderByDescending(x => x.Id)
                .Where(x => x.ExamName == examName)
                .ToListAsync();
        }


        public async Task<IEnumerable<Report>> GetFilteredExamsReportsByName(DateTime startDate, DateTime endDate, string examName)
        {
            return await _dbContext.ExamReports
                .OrderByDescending(x => x.Id)
                .Where(x => x.ExamName == examName && x.DateTaken >= startDate && x.DateTaken <= endDate )                
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamTaken>> PendingExamsByClientId(int id) {
            return await _dbContext.ExamsTaken
                .OrderBy(x => x.Name)
                .Where(x => x.ClientUserProfileId.GetValueOrDefault() == id && x.HasBeenTaken == false)
                .ToListAsync();
        }
        public async Task<IEnumerable<ExamTaken>> PendingExamsByUserId(string userId)
        {
            return await _dbContext.ExamsTaken
                .OrderBy(x => x.Name).Where(e => e.UserId == userId && e.HasBeenTaken == false)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamTaken>> TakenExamsByClientId(int id)
        {
            return await _dbContext.ExamsTaken
                .OrderBy(x => x.Name).Where(x => x.ClientUserProfileId.GetValueOrDefault() == id && x.HasBeenTaken == true)
                .ToListAsync();
        }
        public async Task<IEnumerable<ExamTaken>> TakenExamsByUserId(string userId)
        {
            return await _dbContext.ExamsTaken
                .OrderBy(x => x.Name).Where(e => e.UserId == userId && e.HasBeenTaken == true)
                .ToListAsync();
        }


        public void AddQuestion(Question question) {
            _dbContext.Add(question);
        }
        public void RemoveQuestion(Question question) {
            _dbContext.Remove(question);
        }

        public async Task<IEnumerable<Question>> GetQuestionsByExamId(int examId) {
            return await _dbContext.Questions
                .OrderByDescending(x => x.Id)
                .Where(a => a.ExamId == examId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Question>> GetQuestionByQText(string qText) {
            return await _dbContext.Questions.Where(q => q.Text == qText).ToListAsync();
        }

        public async Task<Question> GetQuestionById(int questionId) {
            return await _dbContext.Questions
                .SingleOrDefaultAsync(q => q.Id == questionId);
                
        }
        public void AddClientApplication(ClientApplication application) {
            _dbContext.ClientApplications.Add(application);
        }
        public void AddApplication(Application application) {
            _dbContext.Applications.Add(application);
        }

        public void RemoveClientApplication(ClientApplication application) {
            _dbContext.ClientApplications.Remove(application);
        }

        public void RemoveApplication(Application application)
        {
            _dbContext.Applications.Remove(application);
        }


        public async Task<ClientApplication> GetClientApplication(int id) {
           return await _dbContext.ClientApplications
                .SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Application> GetApplication(int id) {
            return await _dbContext.Applications
                .SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<ClientApplication>> GetClientApplications(string userId) {
            var applications =  await _dbContext.ClientApplications
                .Where(x => x.UserId == userId)
                .OrderByDescending(x=>x.Id)
                .ToArrayAsync();
            return applications;
        }

        public async Task<IEnumerable<Application>> GetApplications()
        {
            var applications = await _dbContext.Applications
                .OrderByDescending(x => x.Id)
                .ToArrayAsync(); 
            return applications;
        }

        //ADMINISTRATIVE FUNCTIONS
        public async Task<IEnumerable<AppUser>> GetAllAdminUsers(UserManager<AppUser> userManager)
        {
            var adminUsers = userManager.Users.Include(p => p.AdminUserProfile)
                .Where(u => u.AdminUserProfile != null);
            if (adminUsers != null)
            {
                return await adminUsers.ToListAsync();
            }
            return await adminUsers.ToListAsync();
        }

        public async Task<IEnumerable<AppUser>> GetAllAdminUsersByDepartmentId(UserManager<AppUser> userManager, int departmentId) {
            var adminUsers = userManager.Users.Include(p => p.AdminUserProfile)
            .Where(u => u.AdminUserProfile != null && u.AdminUserProfile.DepartmentId == departmentId);
            if (adminUsers != null)
            {
                return await adminUsers.ToListAsync();
            }
            return await adminUsers.ToListAsync();
        }
        public async Task<IEnumerable<AppUser>> GetAllAdminUsersNoDepartment(UserManager<AppUser> userManager){
            var adminUsers = userManager.Users.Include(p => p.AdminUserProfile)
            .Where(u => u.AdminUserProfile != null && u.AdminUserProfile.DepartmentId == null);
            if (adminUsers != null)
            {
                return await adminUsers.ToListAsync();
            }
            return await adminUsers.ToListAsync();
        }

        public async Task<IEnumerable<AppUser>> GetAllUsers(UserManager<AppUser> userManager)
        {
            var users = await userManager.Users.ToArrayAsync();

            if (users != null)
            {
                return users;
            }
            return users;
        }

        public async Task<IdentityRole> GetRoleByName(string roleName, RoleManager<IdentityRole> roleManager)
        {
            IdentityRole role = await roleManager.FindByNameAsync(roleName);
            if (role != null)
            {
                return role;
            }
            return role;
        }
        public async Task<IEnumerable<IdentityRole>> GetUserRoles(RoleManager<IdentityRole> roleManager)
        {
            var userRoles = await roleManager.Roles.ToArrayAsync();
            if (userRoles != null)
            {
                return userRoles;
            }
            return userRoles;
        }


        public async Task<IdentityRole> CreateRole(string roleName, RoleManager<IdentityRole> roleManager)
        {
            var role = new IdentityRole { Name = roleName };
            IdentityResult result = await roleManager.CreateAsync(role);
            if (result.Succeeded)
            {
                return role;
            }
            else
            {
                return role;
            }
        }

        public async Task<IdentityRole> DeleteRole(string id, RoleManager<IdentityRole> roleManager)
        {
            var role = await roleManager.FindByIdAsync(id);
            if (role != null)
            {
                IdentityResult result = await roleManager.DeleteAsync(role);
                if (result.Succeeded)
                {
                    return role;
                }
                else
                {
                    return null;
                }
            }
            else return null;
        }

        public async Task<IdentityRole> GetRole(string id, RoleManager<IdentityRole> roleManager)
        {
            IdentityRole role = await roleManager.FindByIdAsync(id);
            if (role != null)
            {
                return role;
            }
            return role;
        }

        public async Task<IEnumerable<AppUser>> GetAllClientUsers(UserManager<AppUser> userManager)
        {
            var clientUser = userManager.Users.Include(p => p.ClientUserProfile)
                .Where(i => i.ClientUserProfile != null);
            if (clientUser != null)
            {
                return await clientUser.ToListAsync();
            }
            return await clientUser.ToListAsync();
        }

        public async Task<AppUser> GetAdminUserWithProfile(string id, UserManager<AppUser> userManager)
        {
            var user = userManager.Users.Include(p => p.AdminUserProfile).SingleOrDefaultAsync(u => u.Id == id); ;
            if (user != null)
            {
                return await user;
            }
            return await user;
        }

        public async Task<AppUser> GetClientUserByUserId(string userId, UserManager<AppUser> userManager)
        {
            var user = userManager.Users
                .Include(p => p.ClientUserProfile)
                .ThenInclude(x=>x.WrittenExams)
                .SingleOrDefaultAsync(i => i.Id == userId);
            if (user != null)
            {
                return await user;
            }
            return await user;
        }

        public void DeleteClientUserProfile(ClientUserProfile profile)
        {
            _dbContext.ClientUserProfile.Remove(profile);
        }


        public async Task<AppUser> GetClientUserWithProfileByUsername(string username, UserManager<AppUser> userManager)
        {
            var user = userManager.Users
                .Include(x => x.ClientUserProfile)
                .SingleOrDefaultAsync(u => u.UserName == username);
            if (user != null)
            {
                return await user;
            }
            return await user;
        }

        public async Task<AppUser> GetClientUserWithProfile(string id, UserManager<AppUser> userManager)
        {
            var user = userManager.Users
                .Include(x => x.ClientUserProfile)
                .SingleOrDefaultAsync(u => u.Id == id);
            if (user != null)
            {
                return await user;
            }
            return await user;
        }
        public async Task<AppUser> GetIdentityUser(string id, UserManager<AppUser> userManager)
        {
            var user = await userManager.Users.SingleOrDefaultAsync(u => u.Id == id);
            if (user != null)
            {
                return user;
            }
            return user;
        }

        public async Task<AppUser> GetUserWithProfileData(string id, UserManager<AppUser> userManager)
        {
            var user = await userManager.Users
                .Include(x=>x.ClientUserProfile)
                .ThenInclude(e=>e.WrittenExams)
                .SingleOrDefaultAsync(u => u.Id == id);
            if (user != null)
            {
                return user;
            }
            return user;
        }

        //Log Implementaion 
        public async Task<IEnumerable<Log>> GetLogs()
        {
            return await _dbContext.Logs
                .OrderByDescending(x=>x.DateCreated)
                .ToListAsync();
        }
        public void AddLog(Log log)
        {
            _dbContext.Logs.Add(log);
        }
        public async Task<Log> GetLogByDate(DateTime date)
        {
            return await _dbContext.Logs.SingleOrDefaultAsync(x => x.DateCreated.Date == date.Date);
        }

        public async Task<Log> GetLogById(int id)
        {
            return await _dbContext.Logs.SingleOrDefaultAsync(x => x.Id == id);
        }

        public void RemoveLog(Log log)
        {
            _dbContext.Logs.Remove(log);
        }
        public async Task<IEnumerable<Log>> GetLogsBetweenDates(DateTime firstDate, DateTime secondDate)
        {
            return await _dbContext.Logs.Where(i => i.DateCreated >= firstDate && i.DateCreated <= secondDate).ToArrayAsync();
        }

        public async Task<IEnumerable<CompanyInfo>> GetCompanyInfos()
        {
            var company = await _dbContext.CompanyInfos.ToListAsync();
            return company;
        }

        public void AddCompanyInfos(CompanyInfo companyInfo)
        {
            _dbContext.CompanyInfos.Add(companyInfo);
        }

        //Notification Methods Implementation
        public void RemoveMultipleNotifications(List<Notification> notifications)
        {
            if (notifications.Count > 0)
            {
                _dbContext.Notifications.RemoveRange(notifications);
            }
        }
        public async Task<IEnumerable<Notification>> GetNotifications()
        {
            return await _dbContext.Notifications.ToListAsync();
        }
        public void AddNotification(Notification notification)
        {
            _dbContext.Notifications.Add(notification);
        }
        public async Task<Notification> GetNotificationById(int id)
        {
            return await _dbContext.Notifications
                .SingleOrDefaultAsync(i => i.Id == id);
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByView(bool isOpened)
        {
            return await _dbContext.Notifications
                .Where(i => i.IsOpened == isOpened).ToListAsync();
        }

        public void RemoveNotification(Notification notification)
        {
            _dbContext.Notifications.Remove(notification);
        }

        //Departments
        public async Task<IEnumerable<Department>> GetDepartments()
        {
            return await _dbContext.Departments
                .OrderBy(x => x.Name)
                .ToListAsync();
        }
        public async Task<Department> GetDepartment(int departmentId) {
            return await _dbContext
                .Departments
                .SingleOrDefaultAsync(i => i.Id == departmentId);
        }

        public async Task<Department> GetDepartmentWithUsers(int departmentId)
        {
            return await _dbContext
                .Departments
                .Include(x=>x.AdminUserProfiles)
                .Include(y=>y.Exams)
                .SingleOrDefaultAsync(i => i.Id == departmentId);
        }

        public void AddDepartment(Department department)
        {
            _dbContext.Add(department);
        }
        public void DeleteDepartment(Department department)
        {
            _dbContext.Departments.Remove(department);
        }

        public void AddDocumentAttachement(ClientUploadedImage attachment) {
            _dbContext.ClientUploadedImages.Add(attachment);
        }

        public void RemoveDocumentAttachement(ClientUploadedImage attachment)
        {
            _dbContext.ClientUploadedImages.Remove(attachment);
        }

        public async Task<IEnumerable<ClientUploadedImage>> GetClientUploadedImages(int clientProfileId) {
            return await _dbContext.ClientUploadedImages.Where(x => x.ClientUserProfileId == clientProfileId)
               .OrderByDescending(x => x.DateCreated)
               .ToListAsync();
        }

        public async Task<ClientUploadedImage> GetClientUploadImage(string fileName) {
            return await _dbContext
                .ClientUploadedImages
                .SingleOrDefaultAsync(x => x.FileName == fileName);                      
        }
    }
}
