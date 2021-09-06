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
using MimeKit;
using MimeKit.Text;
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

        public ExaminationController(IAppRepository repository,
            IMapper autoMapper,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor contextAccessor,
            IConfiguration configuration,
            IEmailSender emailSender,
            UserManager<AppUser> userManager,
            IWebHostEnvironment host
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
            var exams = await _appRepository.GetExams();
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
                ScheduledDate = examTakenDTO.ScheduledDate,
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
            //var writtenExam = await _appRepository.GetWrittenExam(id);
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
            //Create a new pdf  document
            PdfDocument document = new PdfDocument();
            //Add a page to the document
            PdfPage page = document.Pages.Add();
            //Create Pdf graphics for the page
            PdfGraphics graphics = page.Graphics;
            //Load the image as stream.
            var imagePath = Path.Combine(_host.WebRootPath);
            var filePath = Path.Combine(imagePath, "CAA_Big_Logo.png");
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
            var passStatus = percentage >= 50 ? "Passed" : "Failed";
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
            await smtp.ConnectAsync(_configuration["EmailSettings:MailServer"], int.Parse(_configuration["EmailSettings:Port"]), SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_configuration["EmailSettings:Sender"], _configuration["EmailSettings:AdminPass"]);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
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
                        SelectedAnswer = item.SelectedAnswer
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
            var records = await _appRepository.GetExamRecords(examId);
            var result = _autoMapper.Map<IEnumerable<Report>, IEnumerable<ReportDTO>>(records);
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
            _appRepository.AddClientApplication(clientApplication);
            _appRepository.AddApplication(serverApplication);
            //_unitOfWork.GetAppDbContext().Entry(clientApplication).State = EntityState.Added;
            var clientapplications = await _appRepository.GetClientApplications(userId);    
            await _unitOfWork.CompletionAsync();
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
    }
}
