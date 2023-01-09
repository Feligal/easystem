using AutoMapper;
using EASystem.Extensions;
using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
using EASystem.Models.ViewModels;
using EASystem.Persistence;
using EASystem.Resources;
using MailKit.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Syncfusion.Drawing;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using Syncfusion.Pdf.Tables;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace EASystem.Controllers
{
    public class ExaminationController : Controller
    {
        private readonly IAppRepository _appRepository;
        private readonly IMapper _autoMapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly UserManager<AppUser> _userManager;
        private readonly IWebHostEnvironment _host;
        private readonly AttachmentSetting _attachmentSettings;

        public ExaminationController(
            IAppRepository repository,
            IMapper autoMapper,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor contextAccessor,
            IConfiguration configuration,
            IEmailSender emailSender,
            UserManager<AppUser> userManager,
            IWebHostEnvironment host,
            IOptionsSnapshot<AttachmentSetting> optionsSnapshot
            )
        {
            _appRepository = repository;
            _autoMapper = autoMapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = contextAccessor;
            _configuration = configuration;
            _emailSender = emailSender;
            _userManager = userManager;
            _host = host;
            _attachmentSettings = optionsSnapshot.Value;

        }
        [Authorize(Roles = ("ClientUserRole, AdminUserRole,ExamUserRole"))]
        [HttpGet("/api/allexams")]
        public async Task<ActionResult> GetAllExams() {
            //var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            IEnumerable<Exam> exams = null;
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                //Get Exams by department Id
                exams = await _appRepository.GetExamsByDepartmentId(user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else {
                exams = await _appRepository.GetExams();
            }
                        
            if (exams == null) {
                return NotFound("Resources not found, try again later");
            }
            var result = _autoMapper.Map<IEnumerable<Exam>, IEnumerable<ExamDTO>>(exams);
            return Ok(result);
        }


        [Authorize(Roles = ("ClientUserRole, AdminUserRole,ExamUserRole"))]
        [HttpGet("/api/exams")]
        public async Task<ActionResult> GetExams()
        {
            //var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            var exams = await _appRepository.GetExams();            
            var result = _autoMapper.Map<IEnumerable<Exam>, IEnumerable<ExamDTO>>(exams);
            return Ok(result);
        }


        [Authorize(Roles = ("ClientUserRole, AdminUserRole"))]
        [HttpGet("/api/getexam/{examId}")]
        public async Task<ActionResult> GetExamById(int examId)
        {
            var exam = await _appRepository.GetExam(examId);
            if (exam == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<Exam, ExamDTO>(exam);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("/api/createexam")]
        public async Task<ActionResult> CreateExam([FromBody] ExamDTO exam) {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newExam = _autoMapper.Map<ExamDTO, Exam>(exam);            
            _appRepository.AddExam(newExam);
            _unitOfWork.GetAppDbContext().Entry(newExam).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var department = await _appRepository.GetDepartment(exam.DepartmentId.GetValueOrDefault());
            var newLog = new Log
            {
                LogInformation = $"{newExam.Name} examination in {department.Name} was created on system.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            IEnumerable<Exam> exams = null;
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                //Get Exams by department Id
                exams = await _appRepository.GetExamsByDepartmentId(user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else
            {
                exams = await _appRepository.GetExams();
            }
            var result = _autoMapper.Map<IEnumerable<Exam>, IEnumerable<ExamDTO>>(exams);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPut("/api/editexam/{examId}")]
        public async Task<ActionResult> EditExam(int examId,  [FromBody] ExamDTO exam)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var examToUpdate = await _appRepository.GetExam(examId);
            examToUpdate.Name = exam.Name;
            examToUpdate.PassMarkPercentage = exam.PassMarkPercentage;
            examToUpdate.DepartmentId = exam.DepartmentId;

            _unitOfWork.GetAppDbContext().Entry(examToUpdate).State = EntityState.Modified;
            await _unitOfWork.CompletionAsync();
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var department = await _appRepository.GetDepartment(exam.DepartmentId.GetValueOrDefault());
            var newLog = new Log
            {
                LogInformation = $"{examToUpdate.Name} examination in {department.Name} was updated.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            IEnumerable<Exam> exams = null;
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                //Get Exams by department Id
                exams = await _appRepository.GetExamsByDepartmentId(user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else
            {
                exams = await _appRepository.GetExams();
            }
            var result = _autoMapper.Map<IEnumerable<Exam>, IEnumerable<ExamDTO>>(exams);
            return Ok(result);
        }



        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("/api/createquestion")]
        public async Task<ActionResult> CreateQuestion(string question,IFormFile file = null)
        {
            //Converting the String Question to JSON Object
            QuestionDTO json = JsonConvert.DeserializeObject<QuestionDTO>(question);          
            var newQuetion = _autoMapper.Map<QuestionDTO, Question>(json);

            if (file != null)
            {
                if (file.Length == 0) return BadRequest("Empty file");
                if (file.Length > _attachmentSettings.MaxBytes) return BadRequest("Exceeded file size of " + (_attachmentSettings.MaxBytes / (1024 * 1024) + "Mb"));
                if (!_attachmentSettings.IsSupported(file.FileName)) return BadRequest("Invalid file type.");
                var uploadFolderPath = Path.Combine(_host.WebRootPath, "questionDiagramImages");
                if (!Directory.Exists(uploadFolderPath))
                {
                    Directory.CreateDirectory(uploadFolderPath);
                }
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadFolderPath, fileName);

                var q = await _appRepository.GetQuestionByQText(newQuetion.Text);
                if (q.Count() > 0)
                {
                    return Ok(new { error = "questionExist" });
                }
                else
                {
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                        stream.Dispose();
                    }
                    newQuetion.Image = fileName;
                    _appRepository.AddQuestion(newQuetion);
                    _unitOfWork.GetAppDbContext().Entry(newQuetion).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                    var exam = await _appRepository.GetExam(newQuetion.ExamId);
                    var newLog = new Log
                    {
                        LogInformation = $"Added a question to {exam.Name} examination.",
                        DateCreated = DateTime.Now,
                        Owner = userName
                    };
                    _appRepository.AddLog(newLog);
                    _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    var result = _autoMapper.Map<Question, QuestionDTO>(newQuetion);
                    return Ok(result);
                }
            }
            else {
                var q = await _appRepository.GetQuestionByQText(newQuetion.Text);
                if (q.Count() > 0)
                {
                    return Ok(new { error = "questionExist" });
                }
                else {
                    _appRepository.AddQuestion(newQuetion);
                    _unitOfWork.GetAppDbContext().Entry(newQuetion).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                    var exam = await _appRepository.GetExam(newQuetion.ExamId);
                    var newLog = new Log
                    {
                        LogInformation = $"Added a question to {exam.Name} examination.",
                        DateCreated = DateTime.Now,
                        Owner = userName
                    };
                    _appRepository.AddLog(newLog);
                    _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    var result = _autoMapper.Map<Question, QuestionDTO>(newQuetion);
                    return Ok(result);
                }                
            }                       
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPut("/api/editquestion/{questionId}")]
        public async Task<ActionResult> EditQuestionById(int questionId, string question, IFormFile file = null)
        {
            //Converting the String Question to JSON Object
            QuestionDTO json = JsonConvert.DeserializeObject<QuestionDTO>(question);
            var newQuetion = _autoMapper.Map<QuestionDTO, Question>(json);
            if (newQuetion.Id != questionId)
            {
                return BadRequest(ModelState);
            }
            var questionToEdit = await _appRepository.GetQuestionById(questionId);
            if (questionToEdit == null)
            {
                return NotFound();
            }

            if (file != null)
            {
                if (file.Length == 0) return BadRequest("Empty file");
                if (file.Length > _attachmentSettings.MaxBytes) return BadRequest("Exceeded file size of " + (_attachmentSettings.MaxBytes / (1024 * 1024) + "Mb"));
                if (!_attachmentSettings.IsSupported(file.FileName)) return BadRequest("Invalid file type.");
                var uploadFolderPath = Path.Combine(_host.WebRootPath, "questionDiagramImages");
                if (!Directory.Exists(uploadFolderPath))
                {
                    Directory.CreateDirectory(uploadFolderPath);
                }
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadFolderPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                    stream.Dispose();
                }
                questionToEdit.Text = newQuetion.Text;
                questionToEdit.AnswerA = newQuetion.AnswerA;
                questionToEdit.AnswerB = newQuetion.AnswerB;
                questionToEdit.AnswerC = newQuetion.AnswerC;
                questionToEdit.AnswerD = newQuetion.AnswerD;
                questionToEdit.Image = fileName;
                questionToEdit.CorrectAnswer = newQuetion.CorrectAnswer;
                _unitOfWork.GetAppDbContext().Entry(questionToEdit).State = EntityState.Modified;
                await _unitOfWork.CompletionAsync();

                var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                var exam = await _appRepository.GetExam(questionToEdit.ExamId);
                var newLog = new Log
                {
                    LogInformation = $"Edited question {questionToEdit.Text} in {exam.Name} examination",
                    DateCreated = DateTime.Now,
                    Owner = userName
                };
                _appRepository.AddLog(newLog);
                _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
                await _unitOfWork.CompletionAsync();

                var result = _autoMapper.Map<Question, QuestionDTO>(questionToEdit);
                return Ok(result);
            }
            else {
                questionToEdit.Text = newQuetion.Text;
                questionToEdit.AnswerA = newQuetion.AnswerA;
                questionToEdit.AnswerB = newQuetion.AnswerB;
                questionToEdit.AnswerC = newQuetion.AnswerC;
                questionToEdit.AnswerD = newQuetion.AnswerD;
                questionToEdit.CorrectAnswer = newQuetion.CorrectAnswer;
                _unitOfWork.GetAppDbContext().Entry(questionToEdit).State = EntityState.Modified;
                await _unitOfWork.CompletionAsync();

                var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                var exam = await _appRepository.GetExam(questionToEdit.ExamId);
                var newLog = new Log
                {
                    LogInformation = $"Edited question {questionToEdit.Text} in {exam.Name} examination",
                    DateCreated = DateTime.Now,
                    Owner = userName
                };
                _appRepository.AddLog(newLog);
                _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
                await _unitOfWork.CompletionAsync();
                var result = _autoMapper.Map<Question, QuestionDTO>(questionToEdit);
                return Ok(result);
            }            
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/deletequestion/{questionId}")]
        public async Task<ActionResult> DeleteQuestion(int questionId)
        {
            var question = await _appRepository.GetQuestionById(questionId);
            if (question == null) {
                return NotFound();
            }
            _appRepository.RemoveQuestion(question);
            _unitOfWork.GetAppDbContext().Entry(question).State = EntityState.Deleted;
            await _unitOfWork.CompletionAsync();


            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var exam = await _appRepository.GetExam(question.ExamId);
            var newLog = new Log
            {
                LogInformation = $"Deleted a question from {exam.Name} examination.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var result = _autoMapper.Map<Question, QuestionDTO>(question);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/cancelexam/{id}")]
        public async Task<ActionResult> CancelExam(int id)
        {
            var exemToRemove = await _appRepository.GetWrittenExam(id);
            if (exemToRemove == null)
            {
                return NotFound();
            }
            _appRepository.CancelExam(exemToRemove);
            _unitOfWork.GetAppDbContext().Entry(exemToRemove).State = EntityState.Deleted;
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;            
            var newLog = new Log
            {
                LogInformation = $"Cancelled scheduled examination.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var result = _autoMapper.Map<ExamTaken, ExamTakenDTO>(exemToRemove);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/deleteexam/{id}")]
        public async Task<ActionResult> DeleteExam(int id)
        {
            var examToRemove = await _appRepository.GetExamWithQuestion(id);
            if (examToRemove == null)
            {
                return NotFound("Resource not found");
            }
            _appRepository.DeleteExam(examToRemove);
            _unitOfWork.GetAppDbContext().Entry(examToRemove).State = EntityState.Deleted;
            await _unitOfWork.CompletionAsync();


            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"Deleted {examToRemove.Name} examination.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            IEnumerable<Exam> exams = null;
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                //Get Exams by department Id
                exams = await _appRepository.GetExamsByDepartmentId(user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else
            {
                exams = await _appRepository.GetExams();
            }
            var result = _autoMapper.Map<IEnumerable<Exam>, IEnumerable<ExamDTO>>(exams);
            return Ok(result);
        }


        [Authorize(Roles = ("ClientUserRole, AdminUserRole"))]
        [HttpGet("/api/getquestions/{examId}")]
        public async Task<ActionResult> GetQuestionsByExamId(int examId)
        {
            var questions = await _appRepository.GetQuestionsByExamId(examId);
            if (questions == null) {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<Question>, IEnumerable<QuestionViewModel>>(questions);
            return Ok(result);
        }

        [Authorize(Roles = ("ClientUserRole"))]
        [HttpGet("/api/getshufflequestions/{examId}/{numberOfQuestions}")]
        public async Task<ActionResult> GetShuffledQuestionsByExamId(int examId, int numberOfQuestions)
        {
            //Get the all the quetion from the exam by eaxam Id
            var questions = await _appRepository.GetQuestionsByExamId(examId);                                  
            if (questions == null)
            {
                return NotFound();
            }
            //Randomise the question generation
            var shuffledQuestions = questions.Shuffle();
            shuffledQuestions = questions.Shuffle();            
            if (shuffledQuestions.Count() > numberOfQuestions)
            {
                shuffledQuestions = shuffledQuestions.Take(numberOfQuestions);
            }            
            var result = _autoMapper.Map<IEnumerable<Question>, IEnumerable<QuestionViewModel>>(shuffledQuestions);
            return Ok(result);
        }

        [Authorize(Roles = ("ClientUserRole, AdminUserRole"))]
        [HttpGet("/api/getquestion/{questionId}")]
        public async Task<ActionResult> GetQuestionById(int questionId)
        {
            var question = await _appRepository.GetQuestionById(questionId);
            if (question == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<Question, QuestionDTO>(question);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/schedulesubjectexams/{examName}")]
        public async Task<ActionResult> GetScheduleSubjectExamId(string examName)
        {
            IEnumerable<ExamTaken> exams = null;
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                exams = await _appRepository.GetExamPendingActiveByDepartmentId(examName, user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else
            {
                exams = await _appRepository.GetExamPendingActive(examName);
            }
            if (exams == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<ExamTaken>,IEnumerable<ExamTakenDTO>>(exams);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPut("/api/activatescheduledexam/{id}")]
        public async Task<ActionResult> ActivateScheduledExam(int id)
        {
            var examsToActivate = await _appRepository.GetExamToActivate(id);            
            if (examsToActivate == null)
            {
                return NotFound();
            }
            examsToActivate.IsActivated = true;
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"Activated {examsToActivate.Name} examination for {examsToActivate.UserName}.",
                DateCreated = DateTime.Now,
                Owner = userName
            };

            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var result = _autoMapper.Map<ExamTaken, ExamTakenDTO>(examsToActivate);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPut("/api/activateselectedexam")]
        public async Task<ActionResult> ActivateScheduledExams([FromBody] IEnumerable<int> selectedIds)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            int counter = 0;
            foreach (var itemId in selectedIds) {
                var examsToActivate = await _appRepository.GetExamToActivate(itemId);                
                if (examsToActivate == null)
                {
                    return NotFound();
                }
                examsToActivate.IsActivated = true;
                await _unitOfWork.CompletionAsync();
                counter++;
            }
            if (counter == selectedIds.Count())
            {
                return Ok(new { success = "success"});
            }
            else {
                return Ok(new { error ="error"});
            }                        
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPut("/api/deleteselectedexam")]
        public async Task<ActionResult> DeleteAllSelectedScheduledExams([FromBody] IEnumerable<int> selectedIds)
        {            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            int counter = 0;
            foreach (var itemId in selectedIds)
            {
                var examsToCancel = await _appRepository.GetExamToActivate(itemId);               
                if (examsToCancel == null)
                {
                    return NotFound();
                }
                _appRepository.CancelExam(examsToCancel);
                await _unitOfWork.CompletionAsync();
                counter++;
            }
            if (counter == selectedIds.Count())
            {
                return Ok(new { success = "success" });
            }
            else
            {
                return Ok(new { error = "error" });
            }
        }

        [Authorize(Roles = ("AdminUserRole,ClientUserRole"))]
        [HttpPost("api/startexam/{id}")]
        public async Task<ActionResult> StartExam(int id,[FromBody] StartExamViewModel startData)
        {
            if (startData.HasStarted) {
                var examToStart = await _appRepository.GetWrittenExam(id);
                if (examToStart == null)
                {
                    return BadRequest("Exam was not found");
                }
                examToStart.TimeStarted = DateTime.Now;
                await _unitOfWork.CompletionAsync();
                return Ok(examToStart);
            }
            else
            {
                return BadRequest("An error occured due to invalid exam data.");
            }            
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("api/assignexam/{examId}/{userId}")]
        public async Task<ActionResult> AssignExam(int examId, string userId, [FromBody] ExamTakenDTO examTakenDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (examTakenDTO.ExamId != examId)
            {
                return BadRequest(ModelState);
            }
            var exam = await _appRepository.GetExam(examId);
            var user = await _appRepository.GetUserWithProfileData(userId, _userManager);
            if (user == null)
            {
                return NotFound();
            }

            var loggedUserId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var loggedUser = await _appRepository.GetAdminUserWithProfile(loggedUserId, _userManager);
            
            if (await _userManager.IsInRoleAsync(loggedUser, "ExamUserRole"))
            {
                int departmentId = loggedUser.AdminUserProfile.DepartmentId.GetValueOrDefault();
                user.ClientUserProfile.WrittenExams.Add(new ExamTaken
                {
                    ExamId = examTakenDTO.ExamId,
                    ClientUserProfileId = user.ClientUserProfile.Id,
                    UserId = userId,
                    UserName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}",
                    UserPhoneNumber = user.PhoneNumber,
                    UserEmail = user.Email,
                    Name = examTakenDTO.Name,
                    Duration = (examTakenDTO.Duration * 60),
                    NumberOfQuestions = examTakenDTO.NumberOfQuestions,
                    PassMarkPercentage = exam.PassMarkPercentage,
                    ScheduledDate = examTakenDTO.ScheduledDate.AddDays(1),
                    DateAdded = DateTime.Now,
                    Score = 0,
                    MarksScored = 0,
                    PassStatus = "Pending",
                    HasBeenTaken = false,
                    DepartmentId = departmentId,
                    ExamTime = examTakenDTO.ExamTime
                }) ;
                await _unitOfWork.CompletionAsync();
            }
            else {
                user.ClientUserProfile.WrittenExams.Add(new ExamTaken
                {
                    ExamId = examTakenDTO.ExamId,
                    ClientUserProfileId = user.ClientUserProfile.Id,
                    UserId = userId,
                    UserName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}",
                    UserPhoneNumber = user.PhoneNumber,
                    UserEmail = user.Email,
                    Name = examTakenDTO.Name,
                    Duration = (examTakenDTO.Duration * 60),
                    NumberOfQuestions = examTakenDTO.NumberOfQuestions,
                    PassMarkPercentage = exam.PassMarkPercentage,
                    ScheduledDate = examTakenDTO.ScheduledDate.AddDays(1),
                    DateAdded = DateTime.Now,
                    Score = 0,
                    MarksScored = 0,
                    PassStatus = "Pending",
                    HasBeenTaken = false,
                    ExamTime = examTakenDTO.ExamTime
                });
                await _unitOfWork.CompletionAsync();
            }

            
            
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;            
            var newLog = new Log
            {
                LogInformation = $"Assigned  {examTakenDTO.Name} examination to {examTakenDTO.UserName}",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var company = await _appRepository.GetCompanyInfos();
            var companyInfo = company.ToList()[0];
            string fromEmail = _configuration["EmailSettings:Sender"];
            string toEmail = user.Email;
            string subject = $"{companyInfo.Aliase} - Examination Schedule Notification";            
            string body = $"Dear Esteemed Client, <br/> This serves to inform you that an exam for <b>{examTakenDTO.Name}</b> has been scheduled for <b>{examTakenDTO.ScheduledDate.AddDays(1):dddd, dd MMMM yyyy}</b> at <b>{examTakenDTO.ExamTime}</b>.<br/> Therefore, you are requested to come to {companyInfo.Aliase} on the same date to take your exam.<br/> Kind regards, <br/><br/> <b>{companyInfo.Aliase} Admin</b>";
            await _emailSender.SendEmail(fromEmail, toEmail, subject, body);

            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(user.ClientUserProfile.WrittenExams);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("api/assignexamtomany/{examId}")]
        public async Task<ActionResult> AssignExamToMany(int examId,  [FromBody] IEnumerable<ExamTakenDTO> examSchedules)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var exam = await _appRepository.GetExam(examId);
            foreach (var item in examSchedules) {
                var user = await _appRepository.GetUserWithProfileData(item.UserId, _userManager);
                if (user == null)
                {
                    return NotFound();
                }

                var loggedUserId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
                var loggedUser = await _appRepository.GetAdminUserWithProfile(loggedUserId, _userManager);
                int departmentId;
                if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
                {
                    departmentId = loggedUser.AdminUserProfile.DepartmentId.GetValueOrDefault();
                    user.ClientUserProfile.WrittenExams.Add(new ExamTaken
                    {
                        ExamId = item.ExamId,
                        ClientUserProfileId = user.ClientUserProfile.Id,
                        UserId = item.UserId,
                        UserName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}",
                        UserPhoneNumber = user.PhoneNumber,
                        UserEmail = user.Email,
                        Name = item.Name,
                        Duration = (item.Duration * 60),
                        NumberOfQuestions = item.NumberOfQuestions,
                        ScheduledDate = item.ScheduledDate.AddDays(1),
                        DateAdded = DateTime.Now,
                        Score = 0,
                        MarksScored = 0,
                        PassMarkPercentage = exam.PassMarkPercentage,
                        IsActivated = false,
                        PassStatus = "Pending",
                        HasBeenTaken = false,
                        DepartmentId = departmentId,
                        ExamTime = item.ExamTime,
                    });
                    await _unitOfWork.CompletionAsync();
                }
                else {                    
                    user.ClientUserProfile.WrittenExams.Add(new ExamTaken
                    {
                        ExamId = item.ExamId,
                        ClientUserProfileId = user.ClientUserProfile.Id,
                        UserId = item.UserId,
                        UserName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}",
                        UserPhoneNumber = user.PhoneNumber,
                        UserEmail = user.Email,
                        Name = item.Name,
                        Duration = (item.Duration * 60),
                        NumberOfQuestions = item.NumberOfQuestions,
                        ScheduledDate = item.ScheduledDate.AddDays(1),
                        DateAdded = DateTime.Now,
                        Score = 0,
                        MarksScored = 0,
                        PassMarkPercentage = exam.PassMarkPercentage,
                        IsActivated = false,
                        PassStatus = "Pending",
                        HasBeenTaken = false,                        
                        ExamTime = item.ExamTime,
                    });
                    await _unitOfWork.CompletionAsync();
                }                                
                var company = await _appRepository.GetCompanyInfos();
                var companyInfo = company.ToList()[0];
                string fromEmail = _configuration["EmailSettings:Sender"];
                string toEmail = user.Email;
                string subject = $"{companyInfo.Aliase} - Examination Schedule Notification";
                string body = $"Dear Esteemed Client, <br/> This serves to inform you that an exam for <b>{item.Name}</b> has been scheduled for <b>{item.ScheduledDate.AddDays(1):dddd, dd MMMM yyyy}</b> at <b>{item.ExamTime}</b>.<br/> Therefore, you are requested to come to {companyInfo.Aliase} on the same date to take your exam.<br/> Kind regards, <br/><br/> <b>{companyInfo.Aliase} Admin</b>";
                await _emailSender.SendEmail(fromEmail, toEmail, subject, body);
            }
            return Ok(new { success ="Success"});
        }

        [Authorize(Roles = ("ClientUserRole"))]
        [HttpPost("api/submitanswers/{id}")]
        public async Task<ActionResult> ProcessSubmittedAnswers(int id, [FromBody] IEnumerable<QuestionAnswerViewModel> submitedAnswers)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
                       
            var writtenExam = await _appRepository.GetWrittenExam(id);
            int counter = 0;
            foreach (var item in submitedAnswers) {
                var question = await _appRepository.GetQuestionById(item.QuestionNumber);
                if (question.CorrectAnswer == item.SelectedAnswer) {
                    counter++;
                }
                //Keeping track of the selected question for review;
                writtenExam.ExamReviews.Add(new ExamReview
                {
                    ExamTakenId = writtenExam.Id,
                    QuestionId = question.Id,
                    SelectedAnswer = item.SelectedAnswer,
                    DateTaken = DateTime.Now
                });
            }
            await _unitOfWork.CompletionAsync();
            var exam = await _appRepository.GetExam(writtenExam.ExamId);
            int percentage = (int)Math.Round((double) counter / submitedAnswers.Count() * 100);
            writtenExam.Score = percentage;
            writtenExam.MarksScored =  counter;
            writtenExam.NumberOfQuestions = submitedAnswers.Count();
            writtenExam.HasBeenTaken = true;
            writtenExam.PassMarkPercentage = exam.PassMarkPercentage;
            writtenExam.PassStatus = percentage >= exam.PassMarkPercentage ? "Passed" : "Failed";
            writtenExam.DateTaken = DateTime.Now;
            writtenExam.TimeFinished = DateTime.Now;
            writtenExam.TimeTakenToWrite = Math.Round(writtenExam.TimeFinished.Subtract(writtenExam.TimeStarted).TotalMinutes,1);
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var user = await _appRepository.GetClientUserWithProfile(userId, _userManager);           
            if (exam != null) {
                if (exam.DepartmentId.HasValue)
                {
                    exam.ExamReports.Add(new Report
                    {
                        ExamId = id,
                        ExamName = writtenExam.Name,
                        Score = percentage,
                        MarksScored = counter,
                        TotalNumberOfQuestions = submitedAnswers.Count(),
                        PassStatus = percentage >= exam.PassMarkPercentage ? "Passed" : "Failed",
                        PassMarkPercentage = exam.PassMarkPercentage,
                        DateTaken = DateTime.Now,
                        ClientName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}",
                        UserPhoneNumber = user.PhoneNumber,
                        UserEmail = user.Email,
                        DepartmentId = exam.DepartmentId
                    });
                }
                else {
                    exam.ExamReports.Add(new Report
                    {
                        ExamId = id,
                        ExamName = writtenExam.Name,
                        Score = percentage,
                        MarksScored = counter,
                        TotalNumberOfQuestions = submitedAnswers.Count(),
                        PassStatus = percentage >= exam.PassMarkPercentage ? "Passed" : "Failed",
                        PassMarkPercentage = exam.PassMarkPercentage,
                        DateTaken = DateTime.Now,
                        ClientName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}",
                        UserPhoneNumber = user.PhoneNumber,
                        UserEmail = user.Email,
                    });
                }                
            }

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"{userName} submitted  {writtenExam.Name} examination for marking.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var status = percentage >= writtenExam.PassMarkPercentage ? "Passed" : "Failed";
            var company = await _appRepository.GetCompanyInfos();
            var companyInfo = company.ToList()[0];
            string fromEmail = _configuration["EmailSettings:Sender"];
            string toEmail = user.Email;
            string subject = $"{companyInfo.Aliase} - Examination Result Notification";
            string body = $"Dear Esteemed Client, <br/> This serves to inform you that you have scored <b>{counter}/{submitedAnswers.Count() }</b> which is <b> {percentage}%</b>. Therefore, you have <b>{status}</b>.<br/>You can download your statement of results from your profile. <br/> Kind regards, <br/><br/> <b>{companyInfo.Aliase} Admin</b>";
            await _emailSender.SendEmail(fromEmail, toEmail, subject, body);

            /*

            //Create a new pdf  document
            PdfDocument document = new PdfDocument();
            //Add a page to the document
            PdfPage page = document.Pages.Add();
            //Create Pdf graphics for the page
            PdfGraphics graphics = page.Graphics;
            //Load the image as stream.
            var imagePath = Path.Combine(_host.WebRootPath);
            var filePath = Path.Combine(imagePath, "logo.png");
            FileStream imageStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            RectangleF bounds = new RectangleF(200, 0, 100, 100);
            PdfBitmap image = new PdfBitmap(imageStream);
            //Draw the image
            graphics.DrawImage(image, bounds);


            PdfBrush solidBrush = new PdfSolidBrush(new PdfColor(126, 151, 173));
            bounds = new RectangleF(0, bounds.Bottom + 90, graphics.ClientSize.Width, 30);
            //Draws a rectangle to place the heading in that region.
            //graphics.DrawRectangle(solidBrush, bounds);
         
            PdfFont font = new PdfStandardFont(PdfFontFamily.Helvetica, 20,PdfFontStyle.Bold);
            graphics.DrawString("Zambia Civil Aviation Authority", font, PdfBrushes.Black, new PointF(0, 140));

            font = new PdfStandardFont(PdfFontFamily.Helvetica, 16, PdfFontStyle.Bold);
            graphics.DrawString("Client Information", font, PdfBrushes.Black, new PointF(0, 260));

            font = font = new PdfStandardFont(PdfFontFamily.Helvetica, 12, PdfFontStyle.Italic);
            graphics.DrawString($"Client Names : {user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}", font, PdfBrushes.Black, new Syncfusion.Drawing.PointF(0, 280));
            graphics.DrawString($"NRC : {user.ClientUserProfile.Nrc}", font, PdfBrushes.Black, new Syncfusion.Drawing.PointF(0, 300));
            graphics.DrawString($"Email : {user.Email}", font, PdfBrushes.Black, new Syncfusion.Drawing.PointF(0, 320));
            graphics.DrawString($"Phone : {user.ClientUserProfile.Phone}", font, PdfBrushes.Black, new Syncfusion.Drawing.PointF(0, 340));
            
            font = new PdfStandardFont(PdfFontFamily.Helvetica, 16, PdfFontStyle.Bold);
            graphics.DrawString("Statement", font, PdfBrushes.Black, new PointF(0, 370));

            PdfLightTable pdfLightTable = new PdfLightTable();
            pdfLightTable.DataSourceType = PdfLightTableDataSourceType.TableDirect;

            //Create Columns
            pdfLightTable.Columns.Add(new PdfColumn("Exam"));
            pdfLightTable.Columns.Add(new PdfColumn("Score"));
            pdfLightTable.Columns.Add(new PdfColumn("Pass Status"));
            pdfLightTable.Columns.Add(new PdfColumn("Duration(Min)"));
            pdfLightTable.Columns.Add(new PdfColumn("# of Questions"));
            pdfLightTable.Columns.Add(new PdfColumn("Date"));

            PdfStringFormat format = new PdfStringFormat
            {
                Alignment = PdfTextAlignment.Center,
                LineAlignment = PdfVerticalAlignment.Middle
            };

            //Create the font for setting the style.
            font = new PdfStandardFont(PdfFontFamily.Helvetica, 12);

            //Creates the header style
            //PdfGridCellStyle headerStyle = new PdfGridCellStyle();
            
            //Apply string format
            for (int i = 0; i < pdfLightTable.Columns.Count; i++) {
                pdfLightTable.Columns[i].StringFormat = format;
            }
            PdfLightTableStyle pdfLightTableStyle = new PdfLightTableStyle();
            pdfLightTableStyle.CellPadding = 2;

            pdfLightTable.Style = pdfLightTableStyle; 
           
            //Declare and define the header style.
            PdfCellStyle headerStyle = new PdfCellStyle(font, PdfBrushes.Black, PdfPens.Black);
            
            headerStyle.BackgroundBrush = new PdfSolidBrush(new PdfColor(126, 151, 173));
            headerStyle.TextBrush = PdfBrushes.Black;
            headerStyle.Font = new PdfStandardFont(PdfFontFamily.Helvetica, 12f, PdfFontStyle.Regular);
            headerStyle.BackgroundBrush = PdfBrushes.LightBlue;
            
            pdfLightTable.Style.HeaderStyle = headerStyle;

            //Style to display header.
            pdfLightTable.Style.ShowHeader = true;

            //Add Rows
           
            
            
            var passStatus = percentage >= int.Parse(_configuration["ExamSettings:Passmark"]) ? "Passed" : "Failed";
            pdfLightTable.Rows.Add(new object[] { 
                writtenExam.Name, 
                $"{percentage} %", 
                passStatus, 
                (writtenExam.Duration / 60), 
                writtenExam.NumberOfQuestions, 
                writtenExam.DateTaken.ToString("MM/dd/yyyy") 
            });
           
            pdfLightTable.Draw(page, new PointF(0, bounds.Bottom + 180));
            MemoryStream stream = new MemoryStream();
            document.Save(stream);
            //Set the position  as '0'
            stream.Position = 0;                        
            //Send email here;
            string fromEmail = _configuration["EmailSettings:Sender"];
            string toEmail = user.Email;
            string subject = "Examination Results Statement";
            string body = $"Dear {user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}, <br/> Kindly find attached your examination result statement.<br/> Kind regards, <br/> CAA Administrator";

            //create message 
            var message = new MimeMessage();
            message.Sender = MailboxAddress.Parse(fromEmail);
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            //message.Body = new TextPart(TextFormat.Html) { Text = body };            
            var builder = new BodyBuilder
            {
                HtmlBody = body
            };            
            builder.Attachments.Add($"{writtenExam.Name}_Results.pdf", stream);
            message.Body = builder.ToMessageBody();
            //message.Attachments.
            //Send email
            using var smtp = new MailKit.Net.Smtp.SmtpClient();
            smtp.CheckCertificateRevocation = false;
            await smtp.ConnectAsync(_configuration["EmailSettings:MailServer"], int.Parse(_configuration["EmailSettings:Port"]), SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_configuration["EmailSettings:Sender"], _configuration["EmailSettings:AdminPass"]);
            await smtp.SendAsync(message);

            await smtp.DisconnectAsync(true);
            
            */
            return Ok(writtenExam) ;
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("api/adminsubmitanswers/{id}")]
        public async Task<ActionResult> ProcessAdminSubmittedAnswers(int id, [FromBody] IEnumerable<QuestionAnswerViewModel> submitedAnswers)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            int counter = 0;
            foreach (var item in submitedAnswers)
            {
                var question = await _appRepository.GetQuestionById(item.QuestionNumber);
                if (question.CorrectAnswer == item.SelectedAnswer)
                {
                    counter++;
                }
            }
            var exam = await _appRepository.GetExam(id);
            var writtenExam = await _appRepository.GetWrittenExam(id);
            int percentage = (int)Math.Round((double)counter / submitedAnswers.Count() * 100);
            writtenExam.Score = percentage;
            writtenExam.MarksScored = counter;
            writtenExam.HasBeenTaken = true;
            writtenExam.NumberOfQuestions = submitedAnswers.Count();
            writtenExam.PassMarkPercentage = exam.PassMarkPercentage;
            writtenExam.PassStatus = percentage >= exam.PassMarkPercentage ? "Passed" : "Failed";
            writtenExam.DateTaken = DateTime.Now;

            await _unitOfWork.CompletionAsync();
            return Ok(new
            {
                Correct = counter,
                Total = submitedAnswers.Count()
            });
        }

        [Authorize(Roles =("ClientUserRole"))]
        [HttpGet("/api/pendingexams")]
        public async Task<ActionResult> GetPendingExams()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var user = await _appRepository.GetClientUserWithProfile(userId, _userManager);
            var pendingExams = await _appRepository.PendingExamsByClientId(user.ClientUserProfile.Id);
            if (pendingExams == null) {
                return NotFound();
            }            
            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(pendingExams);
            return Ok(result);
        }



        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/clientexams/{userId}")]
        public async Task<ActionResult> GetPendingExamsByUserId(string userId)
        {                        
            var pendingExams = await _appRepository.PendingExamsByUserId(userId);
            if (pendingExams == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(pendingExams);
            return Ok(result);
        }


        [Authorize(Roles = ("ClientUserRole"))]
        [HttpGet("/api/gettakenexams")]
        public async Task<ActionResult> GetTakenExams()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var user = await _appRepository.GetClientUserWithProfile(userId, _userManager);
            var takenExams = await _appRepository.TakenExamsByClientId(user.ClientUserProfile.Id);
            if (takenExams == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(takenExams);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/allpendingexam")]
        public async Task<ActionResult> GetTakenAllPendingExams()
        {       
            var loggedUserId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var loggedUser = await _appRepository.GetAdminUserWithProfile(loggedUserId, _userManager);
            IEnumerable<ExamTaken> pendingExams = null;
            if (await _userManager.IsInRoleAsync(loggedUser, "ExamUserRole"))
            {
                int departmentId = loggedUser.AdminUserProfile.DepartmentId.GetValueOrDefault();
                pendingExams = await _appRepository.GetPendingWrittenExamsByDepartmentId(departmentId);
            }
            else {
                pendingExams = await _appRepository.GetPendingWrittenExams();
            }
            
            if (pendingExams == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(pendingExams);
            return Ok(result);
        }



        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/clienttakenexams/{userId}")]
        public async Task<ActionResult> GetTakenExamsByUserId(string userId)
        {
            var takenExams = await _appRepository.TakenExamsByUserId(userId);
            if (takenExams == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(takenExams);
            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("/api/recoveredanswers")]
        public async Task<ActionResult> GetRecoverSubmittedAnswers([FromBody] IEnumerable<QuestionAnswerViewModel> recoveredAnswers)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }            
            var recoveredQuestions = new Collection<Question>();
            foreach (var item in recoveredAnswers)
            {
                var question = await _appRepository.GetQuestionById(item.QuestionNumber);
                if (question != null) {
                    recoveredQuestions.Add(question);
                }
            }
            var result = _autoMapper.Map<IEnumerable<Question>, IEnumerable<QuestionViewModel>>(recoveredQuestions);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/getexamreview/{id}")]
        public async Task<ActionResult> GetExamReview(int id)
        {
            var examReviews = await _appRepository.GetExamReviews(id);
            var examReviewQuestions = new Collection<ExamQReviewModel>();
            if (examReviews == null) {
                return NotFound("Reviews not found, try again later.");
            }
            foreach (var item in examReviews)
            {
                var question = await _appRepository.GetQuestionById(item.QuestionId);
                if (question != null)
                {
                    examReviewQuestions.Add(new ExamQReviewModel
                    {
                        Id = question.Id,
                        Text = question.Text,
                        AnswerA = question.AnswerA,
                        AnswerB = question.AnswerB,
                        AnswerC = question.AnswerC,
                        AnswerD = question.AnswerD,
                        CorrectAnswer = question.CorrectAnswer,
                        SelectedAnswer = item.SelectedAnswer,
                        Image =question.Image,
                    });                    
                }
            }           
            return Ok(examReviewQuestions);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/deleteexamrecord/{id}")]
        public async Task<ActionResult> GetDeleteRecords(int id)
        {
            var examRecord = await _appRepository.GetExamRecord(id);
            if (examRecord == null)
            {
                return NotFound();
            }
            _appRepository.DeleteExamRecord(examRecord);
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"Deleted {examRecord.ExamName} examination record.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var records = await _appRepository.GetAllExamRecords();
            var result = _autoMapper.Map<IEnumerable<Report>, IEnumerable<ReportDTO>>(records);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/deleterecordbyexamid/{id}/{examId}")]
        public async Task<ActionResult> GetDeleteRecords(int id,int examId)
        {
            var examRecord = await _appRepository.GetExamRecord(id);
            if (examRecord == null)
            {
                return NotFound();
            }
            _appRepository.DeleteExamRecord(examRecord);
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"Deleted {examRecord.ExamName} examination record.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var records = await _appRepository.GetExamRecords(examId);
            var result = _autoMapper.Map<IEnumerable<Report>, IEnumerable<ReportDTO>>(records);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/examRecords/{examId}")]
        public async Task<ActionResult> GetExamRecords(int examId)
        {
            var loggedUserId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var loggedUser = await _appRepository.GetAdminUserWithProfile(loggedUserId, _userManager);
            IEnumerable<Report> examRecords;
            if (await _userManager.IsInRoleAsync(loggedUser, "ExamUserRole"))
            {
                int departmentId = loggedUser.AdminUserProfile.DepartmentId.GetValueOrDefault();
                examRecords = await _appRepository.GetExamRecordsByDepatmentId(examId, departmentId);
            }
            else {
                examRecords = await _appRepository.GetExamRecords(examId);
            }                
            if (examRecords == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<Report>, IEnumerable<ReportDTO>>(examRecords);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/allexamrecords")]
        public async Task<ActionResult> GetAllExamRecords()
        {
            var loggedUserId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var loggedUser = await _appRepository.GetAdminUserWithProfile(loggedUserId, _userManager);
            IEnumerable<Report> examRecords = null;            
            if (await _userManager.IsInRoleAsync(loggedUser, "ExamUserRole"))
            {
                int departmentId = loggedUser.AdminUserProfile.DepartmentId.GetValueOrDefault();                
                examRecords = await _appRepository.GetAllExamRecordsByDepartmentId(departmentId);
            }
            else
            {
                examRecords = await _appRepository.GetAllExamRecords();
            }                
            if (examRecords == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<Report>, IEnumerable<ReportDTO>>(examRecords);
            return Ok(result);
        }


        [Authorize(Roles = ("ClientUserRole"))]
        [HttpPost("/api/createapplication")]
        public async Task<ActionResult> CreateApplications([FromBody] ClientApplicationDTO application)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var user = await _appRepository.GetClientUserWithProfile(userId, _userManager);
            application.UserId = userId;
            application.ClientUserProfileId = user.ClientUserProfile.Id;
            application.ApplicationDate = DateTime.Now;
            application.IsOpened = false;
            application.ReadStatus = false;
            
            application.UserName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}";            
            var clientApplication = _autoMapper.Map<ClientApplicationDTO, ClientApplication>(application); 
            var serverApplication = _autoMapper.Map<ClientApplicationDTO, Application>(application);
            serverApplication.Email = user.Email;
            _appRepository.AddClientApplication(clientApplication);
            _appRepository.AddApplication(serverApplication);                         
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"{userName} created application.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var clientapplications = await _appRepository.GetClientApplications(userId);

            //Send Email also notifying the responsible users
            string fromEmail = _configuration["EmailSettings:Sender"];
            string toEmail = _configuration["ExamGroupEmail"]; 
            string subject = $"{application.Subject}";
            string body = $"Dear ALL, <br/> This serves to inform you that you have a message below from <b>{user.Email}</b>.Kindly act promptly on the application request.<br/><br/>" +
                $"<b>Subject: {application.Subject}</b>.<br/><b>Message</b>:<p> {application.ApplicationText}</p>";

                
            await _emailSender.SendEmail(fromEmail, toEmail, subject, body);

            var result = _autoMapper.Map<IEnumerable<ClientApplication>, IEnumerable<ClientApplicationDTO>>(clientapplications);
            return Ok(result);
        }

        [Authorize(Roles = ("ClientUserRole"))]
        [HttpGet("/api/clientapplications")]
        public async Task<ActionResult> GetClientApplications()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var clientapplications = await _appRepository.GetClientApplications(userId);
            var result = _autoMapper.Map<IEnumerable<ClientApplication>, IEnumerable< ClientApplicationDTO>>(clientapplications);
            if (result == null)
            {
                return NotFound("Resource not found, try again later.");
            }            
            return Ok(result);
        }        

        [Authorize(Roles = ("ClientUserRole"))]
        [HttpDelete("/api/deleteclientapplication/{id}")]
        public async Task<ActionResult> DeleteClientApplications(int id)
        {
            var application = await _appRepository.GetClientApplication(id);
            _appRepository.RemoveClientApplication(application);
            await _unitOfWork.CompletionAsync();
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var clientapplications = await _appRepository.GetClientApplications(userId);
            var result = _autoMapper.Map<IEnumerable<ClientApplication>, IEnumerable<ClientApplicationDTO>>(clientapplications);
            if (result == null)
            {
                return NotFound("Resource not found, try again later.");
            }

            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/deleteapplication/{id}")]
        public async Task<ActionResult> DeleteApplications(int id)
        {
            var application = await _appRepository.GetApplication(id);
            _appRepository.RemoveApplication(application);
            await _unitOfWork.CompletionAsync();            
            var applications = await _appRepository.GetApplications();
            var result = _autoMapper.Map<IEnumerable<Application>, IEnumerable<ApplicationDTO>>(applications);
            if (result == null)
            {
                return NotFound("Resource not found, try again later.");
            }


            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"Deleted application from {application.UserName}.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            return Ok(result);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/getapplication/{id}")]
        public async Task<ActionResult> GetApplicationById(int id)
        {
            var application = await _appRepository.GetApplication(id);            
            if (application == null) {                
                return NotFound("Resource not found, try again later.");                
            }
            application.IsOpened = true;
            application.ReadStatus = true;
            await _unitOfWork.CompletionAsync();

            var result = _autoMapper.Map<Application,ApplicationDTO>(application);            
            return Ok(result);
        }

        [Authorize(Roles = ("ClientUserRole"))]
        [HttpGet("/api/getclientapplication/{id}")]
        public async Task<ActionResult> GetClientApplicationById(int id)
        {
            var application = await _appRepository.GetClientApplication(id);
            if (application == null)
            {
                return NotFound("Resource not found, try again later.");
            }
            application.IsOpened = true;
            application.ReadStatus = true;
            await _unitOfWork.CompletionAsync();
            var result = _autoMapper.Map<ClientApplication, ClientApplicationDTO>(application);
            return Ok(result);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/applications")]
        public async Task<ActionResult> GetApplications()
        {            
            var application = await _appRepository.GetApplications();
            var result = _autoMapper.Map<IEnumerable<Application>, IEnumerable<ApplicationDTO>>(application);
            if (result == null)
            {
                return NotFound("Resource not found, try again later.");
            }
            return Ok(result);
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/sendbulkyemail/{id}")]
        public async Task<IActionResult> SendBulkyMessage(string id, [FromBody] BulkyEmailViewModel email)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            List<string> failedEmails = new List<string>();
            var user = await _appRepository.GetClientUserByUserId(id,_userManager);
            string fromEmail = _configuration["EmailSettings:Sender"];
           
            string toEmail = user.Email;
            string subject = email.Subject;
            string body = email.Message;
            try
            {
                await _emailSender.SendEmail(fromEmail, toEmail, subject, body);
            }
            catch (Exception e)
            {
                failedEmails.Add(user.Email);                
            }
            
            if (failedEmails.Count == 0)
            {
                return Ok(new { success = "success" });
            }
            else
            {
                return Ok(new { failedEmails = failedEmails });
            }
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/examstatistics/")]
        public async Task<IActionResult> GetDashboardStatistics() {
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            IEnumerable<Exam> exams = null;
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                //Get Exams by department Id
                exams = await _appRepository.GetExamsByDepartmentId(user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else
            {
                exams = await _appRepository.GetExams();
            }
            //var exams = await _appRepository.GetExams();
            List<ExamStatisticModel> examStatics = new List<ExamStatisticModel>();
            foreach (var exam in exams) {
                int examsPassed = 0;
                int examsFailed = 0;
                var examRecords = await _appRepository.GetExamsReportsByName(exam.Name);
                foreach (var item in examRecords) {
                    if (item.Score >= item.PassMarkPercentage)
                    {
                        examsPassed++;
                    }
                    else {
                        examsFailed++;
                    }
                }
                examStatics.Add(new ExamStatisticModel
                {
                    Name = exam.Name,
                    PassedExams = examsPassed,
                    FailedExams = examsFailed,                                        
                });
            }
            return Ok(examStatics);
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/getfilterdexamstatistics")]
        public async Task<IActionResult> GetFilteredDashboardStatistics([FromBody] DateViewModel dateModel)
        {
            if (!ModelState.IsValid) {
                return BadRequest();
            }

            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _appRepository.GetAdminUserWithProfile(userId, _userManager);
            IEnumerable<Exam> exams = null;
            if (await _userManager.IsInRoleAsync(user, "ExamUserRole"))
            {
                //Get Exams by department Id
                exams = await _appRepository.GetExamsByDepartmentId(user.AdminUserProfile.DepartmentId.GetValueOrDefault());
            }
            else
            {
                exams = await _appRepository.GetExams();
            }
            List<ExamStatisticModel> examStatics = new List<ExamStatisticModel>();
            foreach (var exam in exams)
            {
                int examsPassed = 0;
                int examsFailed = 0;
                var examRecords = await _appRepository.GetFilteredExamsReportsByName(dateModel.StartDate, dateModel.EndDate, exam.Name);
                foreach (var item in examRecords)
                {
                    if (item.Score >= item.PassMarkPercentage)
                    {
                        examsPassed++;
                    }
                    else
                    {
                        examsFailed++;
                    }
                }
                examStatics.Add(new ExamStatisticModel
                {
                    Name = exam.Name,
                    PassedExams = examsPassed,
                    FailedExams = examsFailed,
                });
            }
            return Ok(examStatics);
        }

        //Departments
        [Authorize(Roles = ("AdminUserRole"))]
        [HttpGet("/api/alldepartments")]
        public async Task<ActionResult> GetAllDepartments()
        {
            var departments = await _appRepository.GetDepartments();
            if (departments == null)
            {
                return NotFound("Resources not found, try again later");
            }            
            return Ok(departments);
        }

        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("/api/createdepartment")]
        public async Task<ActionResult> CreateDepartment([FromBody] Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }            
            _appRepository.AddDepartment(department);
            _unitOfWork.GetAppDbContext().Entry(department).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"{department.Name} department was created on system.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var departments = await _appRepository.GetDepartments();            
            return Ok(departments);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPut("/api/updatedepartment/{id}")]
        public async Task<ActionResult> UpdateDepartment(int id, [FromBody] Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var departmentToUpdate = await _appRepository.GetDepartment(id);
            if (departmentToUpdate == null) {
                return NotFound();
            }
            departmentToUpdate.Name = department.Name;
            _unitOfWork.GetAppDbContext().Entry(departmentToUpdate).State = EntityState.Modified;
            await _unitOfWork.CompletionAsync();
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"{department.Name} department was updated.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var departments = await _appRepository.GetDepartments();
            return Ok(departments);
        }


        [Authorize(Roles = ("AdminUserRole"))]
        [HttpDelete("/api/deletedepartment/{id}")]
        public async Task<ActionResult> DeleteDepartment(int id)
        {
            var department = await _appRepository.GetDepartmentWithUsers(id);
            //Detach the profiles from the Departments
            foreach (var userProfile in department.AdminUserProfiles) {
                userProfile.DepartmentId = null;
                await _unitOfWork.CompletionAsync();
            }
            foreach (var exam in department.Exams)
            {
                exam.DepartmentId = null;
                await _unitOfWork.CompletionAsync();
            }
            _appRepository.DeleteDepartment(department);
            _unitOfWork.GetAppDbContext().Entry(department).State = EntityState.Deleted;
            await _unitOfWork.CompletionAsync();
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var newLog = new Log
            {
                LogInformation = $"{department.Name} department was deleted.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _appRepository.AddLog(newLog);
            _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var departments = await _appRepository.GetDepartments();
            return Ok(departments);
        }
    }
}
