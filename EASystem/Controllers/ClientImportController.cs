using EASystem.Models.AuthenticationModels;
using EASystem.Models.HelperModels;
using EASystem.Models.ViewModels;
using EASystem.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EASystem.Controllers
{
    public class ClientImportController:Controller
    {
        private readonly IWebHostEnvironment _host;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAppRepository _repository;
        private readonly DownloadAttachmentSettings _downloadAttachmentSettings;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private AppDbContext _identityContext;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public ClientImportController(
            IWebHostEnvironment host, 
            IUnitOfWork unitOfWork, 
            IAppRepository repository, 
            IOptionsSnapshot<DownloadAttachmentSettings> optionsSnapshotDS, 
            UserManager<AppUser> userManager, 
            RoleManager<IdentityRole> roleManager, AppDbContext context, 
            IHttpContextAccessor httpContextAccessor
            )
        {
            _host = host;
            _unitOfWork = unitOfWork;
            _repository = repository;
            _downloadAttachmentSettings = optionsSnapshotDS.Value;
            _userManager = userManager;
            _roleManager = roleManager;
            _identityContext = context;
            _httpContextAccessor = httpContextAccessor;

        }


        [Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/uploadBulkyClients/")]        
        public async Task<IActionResult> UploadBulkyClients(int examId, IFormFile file)
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
                    var targetPath = Path.Combine(rootFolder, "ImportedClientBulkDocs");                    
                    //Create the directory if it does not exist
                    if (!Directory.Exists(targetPath))
                    {
                        Directory.CreateDirectory(targetPath);
                    }
                    System.IO.DirectoryInfo di = new DirectoryInfo(targetPath);
                    //Delete files from directory
                    foreach (FileInfo filesDelete in di.GetFiles())
                    {
                        filesDelete.Delete();
                    }
                    
                    var filePath = Path.Combine(targetPath, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
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

                            List<string> successUserList = new List<string>();
                            List<string> failedUserList = new List<string>();

                            ClientUserViewModel model = new ClientUserViewModel();
                            for (int row = 2; row <= totalRows; row++)
                            {
                                model.FirstName = workSheet?.Cells[row, 1].Value?.ToString();
                                model.LastName = workSheet?.Cells[row, 2].Value?.ToString();                                
                                model.UserName = workSheet?.Cells[row, 3].Value?.ToString();
                                model.Nrc = workSheet?.Cells[row, 4].Value?.ToString();                                
                                model.PhoneNumber = workSheet?.Cells[row, 5].Value?.ToString();
                                model.Email = workSheet?.Cells[row, 6].Value?.ToString();                                
                                model.Password = workSheet?.Cells[row, 7].Value?.ToString();
                                model.PortraitImage = "";
                                if (model == null)
                                {
                                    failedUserList.Add($"{model.FirstName} {model.LastName}  {model.UserName} was NOT successfully added.");
                                    continue;
                                }
                                //Check if the username/email address already exits
                                AppUser user = await _userManager.FindByNameAsync(model.UserName);
                                if (user != null)
                                {
                                    ModelState.AddModelError("UsernameExists", $"{model.UserName} already exists, try to use a different");
                                    failedUserList.Add($"{model.FirstName} {model.LastName}  {model.UserName} was NOT successfully added.");                                    
                                    continue;
                                }

                                user = await _userManager.FindByEmailAsync(model.Email);
                                if (user != null)
                                {
                                    ModelState.AddModelError("UserEmailExists", $"Another user with that email address {model.Email} already exists.");
                                    failedUserList.Add($"{model.FirstName} {model.LastName}  {model.UserName} was NOT successfully added.");                                    
                                    continue;
                                }
                                user = new AppUser
                                {
                                    SecurityStamp = Guid.NewGuid().ToString(),
                                    UserName = model.UserName,
                                    Email = model.Email,
                                    EmailConfirmed = true,
                                    LockoutEnabled = false,
                                    PhoneNumber = model.PhoneNumber,
                                    ClientUserProfile = new ClientUserProfile
                                    {
                                        FirstName = model.FirstName,
                                        LastName = model.LastName,                                        
                                        UserName = model.UserName,                                                                                
                                        Nrc = model.Nrc,                                        
                                        Phone = model.PhoneNumber,
                                        Email = model.Email,                                                                                                                       
                                    }
                                };
                                var clientUserRole = "ClientUserRole";
                                if (await _roleManager.FindByNameAsync(clientUserRole) == null)
                                {
                                    await _roleManager.CreateAsync(new IdentityRole(clientUserRole));
                                }
                                var result = await _userManager.CreateAsync(user, model.Password);
                                if (result.Succeeded)
                                {
                                    successUserList.Add($"{model.FirstName} {model.LastName}  {model.UserName} was added successfully added.");
                                    result = await _userManager.AddToRoleAsync(user, clientUserRole);
                                    await _userManager.AddClaimAsync(user, new Claim("ClientUser", "ClientUser"));
                                    _identityContext.SaveChanges();

                                    var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                                    var log = new Log
                                    {                                        
                                        LogInformation = $"Client {user.UserName} registered on system.",
                                        DateCreated = DateTime.Now,
                                        Owner = userName
                                    };
                                    _repository.AddLog(log);
                                    _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;                                                                                                            
                                    await _unitOfWork.CompletionAsync();
                                }
                                else
                                {
                                    {
                                        AddErrorsFromResult(result);
                                        failedUserList.Add($"{model.FirstName} {model.LastName}  {model.UserName} was NOT successfully added.");
                                        continue;
                                        //return BadRequest(ModelState);
                                    }
                                }
                            }
                            return Ok(new { SuccessfulAdd = successUserList, UnsuccessfulAdd = failedUserList });
                        }
                        catch (Exception ex)
                        {
                            return BadRequest(ex);
                        }
                    }
                }
            }
            return BadRequest("Selected File is empty, try again later");
        }
        private void AddErrorsFromResult(IdentityResult result)
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }
        }
    }
}
