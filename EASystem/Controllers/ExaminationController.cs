using AutoMapper;
using EASystem.Extensions;
using EASystem.Models.AuthenticationModels;
using EASystem.Models.ExamModels;
using EASystem.Models.ViewModels;
using EASystem.Persistence;
using EASystem.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Claims;
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

        public ExaminationController(IAppRepository repository,
            IMapper autoMapper,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor contextAccessor,
            IConfiguration configuration,
            IEmailSender emailSender,
            UserManager<AppUser> userManager
            )
        {
            _appRepository = repository;
            _autoMapper = autoMapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = contextAccessor;
            _configuration = configuration;
            _emailSender = emailSender;
            _userManager = userManager;

        }
        [Authorize(Roles = ("ClientUserRole, AdminUserRole"))]
        [HttpGet("/api/allexams")]
        public async Task<ActionResult> GetAllExams() {
            var exams = await _appRepository.GetExams();
            if (exams == null) {
                return NotFound("Resources not found, try again later");
            }
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
            var exams = await _appRepository.GetExams();
            var result = _autoMapper.Map<IEnumerable<Exam>, IEnumerable<ExamDTO>>(exams);
            return Ok(result);
        }
        [Authorize(Roles = ("AdminUserRole"))]
        [HttpPost("/api/createquestion")]
        public async Task<ActionResult> CreateQuestion([FromBody] QuestionDTO question)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newQuetion = _autoMapper.Map<QuestionDTO, Question>(question);
            _appRepository.AddQuestion(newQuetion);
            _unitOfWork.GetAppDbContext().Entry(newQuetion).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var result = _autoMapper.Map<Question, QuestionDTO>(newQuetion);
            return Ok(result);
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
            var result = _autoMapper.Map<Question, QuestionDTO>(question);
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
        [HttpPut("/api/editquestion/{questionId}")]
        public async Task<ActionResult> EditQuestionById(int questionId, [FromBody] QuestionDTO questionDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (questionDTO.Id != questionId)
            {
                return BadRequest(ModelState);
            }
            var question = await _appRepository.GetQuestionById(questionId);
            if (question == null)
            {
                return NotFound();
            }
            question.Text = questionDTO.Text;
            question.AnswerA = questionDTO.AnswerA;
            question.AnswerB = questionDTO.AnswerB;
            question.AnswerC = questionDTO.AnswerC;
            question.AnswerD = questionDTO.AnswerD;
            question.CorrectAnswer = questionDTO.CorrectAnswer;
            _unitOfWork.GetAppDbContext().Entry(question).State = EntityState.Modified;
            await _unitOfWork.CompletionAsync();
            var result = _autoMapper.Map<Question, QuestionDTO>(question);
            return Ok(result);
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
            var user = await _appRepository.GetUserWithProfileData(userId, _userManager);
            if (user == null)
            {
                return NotFound();
            }
            user.ClientUserProfile.WrittenExams.Add(new ExamTaken
            {
                ExamId = examTakenDTO.ExamId,
                ClientUserProfileId = user.ClientUserProfile.Id,
                UserId = userId,
                Name = examTakenDTO.Name,
                Duration = (examTakenDTO.Duration * 60),
                NumberOfQuestions = examTakenDTO.NumberOfQuestions,
                DateAdded = DateTime.Now,
                Score = 0,
                PassStatus = "Pending",
                HasBeenTaken = false
            });

            await _unitOfWork.CompletionAsync();
            var result = _autoMapper.Map<IEnumerable<ExamTaken>, IEnumerable<ExamTakenDTO>>(user.ClientUserProfile.WrittenExams);
            return Ok(result);
        }

        [Authorize(Roles = ("ClientUserRole"))]
        [HttpPost("api/submitanswers/{id}")]
        public async Task<ActionResult> ProcessSubmittedAnswers(int id, [FromBody] IEnumerable<QuestionAnswerViewModel> submitedAnswers)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            int counter = 0;
            foreach (var item in submitedAnswers) {
                var question = await _appRepository.GetQuestionById(item.QuestionNumber);
                if (question.CorrectAnswer == item.SelectedAnswer) {
                    counter++;
                }
            }
            var writtenExam = await _appRepository.GetWrittenExam(id);
            int percentage = (int)Math.Round((double) counter / submitedAnswers.Count() * 100);
            writtenExam.Score = percentage;
            writtenExam.HasBeenTaken = true;
            writtenExam.PassStatus = percentage >= 50 ? "Passed" : "Failed";
            writtenExam.DateTaken = DateTime.Now;

            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            var user = await _appRepository.GetClientUserWithProfile(userId, _userManager);

            var exam = await _appRepository.GetExam(writtenExam.ExamId);
            if (exam != null) { 
                exam.ExamReports.Add(new Report
                {
                    ExamId = id,
                    ExamName = writtenExam.Name,
                    Score = percentage,
                    PassStatus = percentage >= 50 ? "Passed" : "Failed",
                    DateTaken = DateTime.Now,
                    ClientName = $"{user.ClientUserProfile.FirstName} {user.ClientUserProfile.LastName}"
                });
            }          
            await _unitOfWork.CompletionAsync();
            return Ok(new
            {
                Correct = counter,
                Total = submitedAnswers.Count()
            }) ;
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
            var exam = await _appRepository.GetWrittenExam(id);
            int percentage = (int)Math.Round((double)counter / submitedAnswers.Count() * 100);
            exam.Score = percentage;
            exam.HasBeenTaken = true;
            exam.PassStatus = percentage >= 50 ? "Passed" : "Failed";
            exam.DateTaken = DateTime.Now;

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
        [HttpGet("/api/examRecords/{examId}")]
        public async Task<ActionResult> GetExamRecords(int examId)
        {
            var examRecords = await _appRepository.GetExamRecords(examId);
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
            var examRecords = await _appRepository.GetAllExamRecords();
            if (examRecords == null)
            {
                return NotFound();
            }
            var result = _autoMapper.Map<IEnumerable<Report>, IEnumerable<ReportDTO>>(examRecords);
            return Ok(result);
        }
    }
}
