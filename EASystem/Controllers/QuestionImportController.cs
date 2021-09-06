using EASystem.Models.ExamModels;
using EASystem.Models.HelperModels;
using EASystem.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Controllers
{
    public class QuestionImportController: Controller
    {
        private readonly IWebHostEnvironment _host;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAppRepository _repository;
        private readonly DownloadAttachmentSettings _downloadAttachmentSettings;
        public QuestionImportController(IWebHostEnvironment host, IUnitOfWork unitOfWork, IAppRepository repository, IOptionsSnapshot<DownloadAttachmentSettings> optionsSnapshotDS)
        {
            _host = host;
            _unitOfWork = unitOfWork;
            _repository = repository;
            _downloadAttachmentSettings = optionsSnapshotDS.Value;

        }
        [HttpPost("/api/uploadBulkyQuestions/{examId}")]
        [Authorize(Roles = "AdminUserRole")]
        public async Task<IActionResult> UploadBulkyQuestions(int examId,IFormFile file)
        {
            if (file != null)
            {
                //File validation
                if (file == null) return BadRequest("Null file");
                if (file.Length == 0) return BadRequest("Empty file");
                if (file.Length > _downloadAttachmentSettings.MaxBytes) return BadRequest("Exceeded file size of " + (_downloadAttachmentSettings.MaxBytes / (1024 * 1024) + "Mb"));
                if (!_downloadAttachmentSettings.IsSupported(file.FileName)) return BadRequest("Invalid file type.");
                if (file.ContentType == "application/vnd.ms-excel" || file.ContentType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                {
                    string fileName = file.FileName;
                    string rootFolder = _host.WebRootPath;
                    var targetPath = Path.Combine(rootFolder, "ExportedQuestionDocs");
                    //Create the directory if it does not exist
                    if (!Directory.Exists(targetPath))
                    {
                        Directory.CreateDirectory(targetPath);
                    }
                    //Delete files from directory
                    System.IO.DirectoryInfo di = new DirectoryInfo(targetPath);
                    foreach (FileInfo filesDelete in di.GetFiles())
                    {
                        filesDelete.Delete();
                    }
                    var filePath = Path.Combine(targetPath, fileName);
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await file.CopyToAsync(stream);
                    stream.Dispose();
                    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                    using ExcelPackage package = new ExcelPackage();
                    using (var fileStream = System.IO.File.OpenRead(filePath))
                    {
                        package.Load(fileStream);
                    }
                    try
                    {
                        ExcelWorksheet workSheet = package.Workbook.Worksheets[0];
                        int totalRows = workSheet.Dimension.Rows;
                        List<string> successfulList = new List<string>();
                        List<string> failedList = new List<string>();
                        for (int row = 2; row <= totalRows; row++)
                        {
                            Question question = new Question
                            {
                                Text = workSheet?.Cells[row, 1].Value?.ToString(),
                                AnswerA = workSheet?.Cells[row, 2].Value?.ToString(),
                                AnswerB = workSheet?.Cells[row, 3].Value?.ToString(),
                                AnswerC = workSheet?.Cells[row, 4].Value?.ToString(),
                                AnswerD = workSheet?.Cells[row, 5].Value?.ToString(),
                                CorrectAnswer = workSheet?.Cells[row, 6].Value?.ToString(),
                                ExamId = examId,
                                Image = "",                                
                            };
                            if (question == null)
                            {
                                failedList.Add($"{question.Text}  was NOT successfully added.");
                                continue;
                            }
                            _repository.AddQuestion(question);
                            try
                            {
                                _unitOfWork.GetAppDbContext().Entry(question).State = EntityState.Added;
                                await _unitOfWork.CompletionAsync();
                                successfulList.Add($"{question.Text} was successfully added.");
                            }
                            catch (Exception ex)
                            {
                                failedList.Add($"{question.Text}  was NOT successfully added.");
                                continue;
                            }
                        }
                        return Ok(new { SuccessfulAdd = successfulList, UnsuccessfulAdd = failedList });
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ex);
                    }
                }
            }
            return BadRequest("Selected File is empty, try again later");
        }
    }
}
