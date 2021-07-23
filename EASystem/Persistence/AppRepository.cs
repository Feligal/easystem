using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
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
        public async Task<IEnumerable<Report>> GetExamRecords(int examId) {
            return await _dbContext.ExamReports
                .OrderByDescending(x => x.DateTaken)
                .Where(x => x.ExamId == examId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetAllExamRecords() {
            return await _dbContext.ExamReports
               .OrderByDescending(x => x.DateTaken)               
               .ToListAsync();
        }
        public async Task<Exam> GetExam(int examId) {
            return await _dbContext.Exams
            .SingleOrDefaultAsync(e => e.Id == examId);            
        }

        public async Task<ExamTaken> GetWrittenExam(int id) {
            return await _dbContext.ExamsTaken
                .SingleOrDefaultAsync(e => e.Id == id);
        }


        public void AddExam(Exam exam) {
            _dbContext.Add(exam);
        }

        public async Task<IEnumerable<ExamTaken>> PendingExamsByClientId(int id) {
            return await _dbContext.ExamsTaken
                .OrderBy(x => x.Name).Where(x => x.ClientUserProfileId.GetValueOrDefault() == id && x.HasBeenTaken == false)
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

        public async Task<Question> GetQuestionById(int questionId) {
            return await _dbContext.Questions
                .SingleOrDefaultAsync(q => q.Id == questionId);
                
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
            var user = userManager.Users.Include(p => p.ClientUserProfile)
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



        public async Task<AppUser> GetClientUserWithProfile(string id, UserManager<AppUser> userManager)
        {
            var user = userManager.Users.Include(x => x.ClientUserProfile)
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
            return await _dbContext.Logs.ToListAsync();
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
    }
}
