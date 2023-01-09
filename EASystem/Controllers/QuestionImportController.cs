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
        private readonly AttachmentSetting _attachmentSettings;
        public QuestionImportController(IWebHostEnvironment host, IUnitOfWork unitOfWork, IAppRepository repository, IOptionsSnapshot<DownloadAttachmentSettings> optionsSnapshotDS, IOptionsSnapshot<AttachmentSetting> optionsSnapshotAS)
        {
            _host = host;
            _unitOfWork = unitOfWork;
            _repository = repository;
            _downloadAttachmentSettings = optionsSnapshotDS.Value;
            _attachmentSettings = optionsSnapshotAS.Value;

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
                if (file.ContentType == "application/vnd.ms-excel" || 
                    file.ContentType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
                    file.ContentType == "application/vnd.ms-excel.sheet.macroEnabled.12")
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
                            string fPath =  workSheet?.Cells[row, 7]?.Value?.ToString();
                            string qText = workSheet?.Cells[row, 1].Value?.ToString();
                            var q = await _repository.GetQuestionByQText(qText);
                            if (fPath != null)
                            {
                                //If the file path for the question image exists
                                string fileItemName = fPath.Split("\\")[fPath.Split("\\").Length - 1];
                                if (!_attachmentSettings.IsSupported(fileItemName))
                                {
                                    failedList.Add($"{fileItemName}  was NOT uploaded due to unsupported format.");
                                }else
                                {                                   
                                    //Check if the current questions already exists in the database
                                    if (q.Count() > 0)
                                    {
                                        failedList.Add($"{ qText } exists already in the database.");
                                        continue;
                                    }else {
                                        using var sourceFileStream = new FileStream(fPath, FileMode.Open);
                                        var uploadFolderPath = Path.Combine(_host.WebRootPath, "questionDiagramImages");
                                        if (!Directory.Exists(uploadFolderPath))
                                        {
                                            Directory.CreateDirectory(uploadFolderPath);
                                        }
                                        var diagramFileName = Guid.NewGuid().ToString() + Path.GetExtension(fileItemName);
                                        var diagramFilePath = Path.Combine(uploadFolderPath, diagramFileName);
                                        using var newFileStream = new FileStream(diagramFilePath, FileMode.Create);
                                        sourceFileStream.CopyTo(newFileStream);
                                        newFileStream.Dispose();
                                        Question newQuestion = new Question
                                        {
                                            Text = workSheet?.Cells[row, 1].Value?.ToString(),
                                            AnswerA = workSheet?.Cells[row, 2].Value?.ToString(),
                                            AnswerB = workSheet?.Cells[row, 3].Value?.ToString(),
                                            AnswerC = workSheet?.Cells[row, 4].Value?.ToString(),
                                            AnswerD = workSheet?.Cells[row, 5].Value?.ToString(),
                                            CorrectAnswer = workSheet?.Cells[row, 6].Value?.ToString(),
                                            ExamId = examId,
                                            Image = diagramFileName,
                                        };
                                        _repository.AddQuestion(newQuestion);
                                        try
                                        {
                                            _unitOfWork.GetAppDbContext().Entry(newQuestion).State = EntityState.Added;
                                            await _unitOfWork.CompletionAsync();
                                            successfulList.Add($"{newQuestion.Text} was successfully added.");
                                        }
                                        catch (Exception ex)
                                        {
                                            failedList.Add($"{newQuestion.Text}  was NOT successfully added.");
                                            continue;
                                        }
                                    }                                                                      
                                }
                            }
                            else {
                                //If the file path does not exist                                
                                if (q.Count() > 0)
                                {
                                    failedList.Add($"{ qText } exists already in the database.");
                                    continue;
                                }
                                else {
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
