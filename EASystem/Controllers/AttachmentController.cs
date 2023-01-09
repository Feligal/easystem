using AutoMapper;
using EASystem.Persistence;
using EASystem.Models.HelperModels;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using EASystem.Models.AuthenticationModels;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Security.Claims;
using EASystem.Models.ExamModels;
using Microsoft.EntityFrameworkCore;
using EASystem.Resources;

namespace EASystem.Controllers
{
    public class AttachmentController: Controller
    {
        private readonly IWebHostEnvironment _host;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAppRepository _repository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;        
        private readonly AttachmentSetting _attachmentSettings;
        private readonly DownloadAttachmentSettings _downloadAttachmentSettings;
        public AttachmentController(
            IWebHostEnvironment host,
            IHttpContextAccessor httpContextAccessor,
            IAppRepository repository,   
            UserManager<AppUser> userManager,
            IMapper mapper,
            IUnitOfWork unitOfWork,            
            IOptionsSnapshot<AttachmentSetting> optionsSnapshot,
            IOptionsSnapshot<DownloadAttachmentSettings> optionsSnapshotDS
            )
        {
            _host = host;
            _httpContextAccessor = httpContextAccessor;
            _repository = repository;
            _userManager = userManager;
            _mapper = mapper;
            _unitOfWork = unitOfWork;            
            _attachmentSettings = optionsSnapshot.Value;
            _downloadAttachmentSettings = optionsSnapshotDS.Value;
        }
        

        [Authorize(Roles = "AdminUserRole,ClientUserRole")]
        [HttpPost("/api/uploadPotrait/{userId}")]
        public async Task<IActionResult> UploadClientPortrait(string userId, IFormFile file)
        {
            var client = await _repository.GetClientUserByUserId(userId, _userManager);
            if (client == null)
            {
                return NotFound();
            }
            //File validation
            if (file == null) return BadRequest("Null file");
            if (file.Length == 0) return BadRequest("Empty file");
            if (file.Length > _attachmentSettings.MaxBytes) return BadRequest("Exceeded file size of " + (_attachmentSettings.MaxBytes / (1024 * 1024) + "Mb"));
            if (!_attachmentSettings.IsSupported(file.FileName)) return BadRequest("Invalid file type.");
            var uploadFolderPath = Path.Combine(_host.WebRootPath, "clientPortraits");
            if (!Directory.Exists(uploadFolderPath))
            {
                Directory.CreateDirectory(uploadFolderPath);
            }
            var fileName = client.ClientUserProfile.FirstName + "_" + client.ClientUserProfile.LastName + "_" + Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadFolderPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
                stream.Dispose();
            }
            var thumbNailFolderPath = Path.Combine(_host.WebRootPath, "clientThumbnailPortraits");
            if (!Directory.Exists(thumbNailFolderPath))
            {
                Directory.CreateDirectory(thumbNailFolderPath);
            }
            var thumbnailFileName = "thumbnail_" + fileName;
            var thumbnailFilePath = Path.Combine(thumbNailFolderPath, thumbnailFileName);
            var thumbnailImage = Image.FromFile(filePath);
            CreateAndSaveThumbnail(thumbnailImage, 150, thumbnailFilePath);
            //Saving the portrait filename of the client;
            client.ClientUserProfile.PortraitImage = thumbnailFileName;
            //_unitOfWork.GetAppIdentityDbContext().Entry(client).State = EntityState.Modified;
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            //_logger.LogInformation("User: " + userName + " uploaded client portrait.");
            var log = new Log
            {
                LogInformation = $"{userName} uploaded client portrait.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            //_repository.AddLog(log);
            //_unitOfWork.GetAppIdentityDbContext().Entry(log).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            return Ok(new { message = "success" });
        }


        [Authorize(Roles = "ClientUserRole")]
        [HttpPost("/api/clientUploadAttachment/")]
        public async Task<IActionResult> UploadClientAttachment(IFormFile file)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var client = await _repository.GetClientUserWithProfile(userId, _userManager);
            if (client == null)
            {
                return NotFound();
            }
            //File validation
            if (file == null) return BadRequest("Null file");
            if (file.Length == 0) return BadRequest("Empty file");
            if (file.Length > _attachmentSettings.MaxBytes) return BadRequest("Exceeded file size of " + (_attachmentSettings.MaxBytes / (1024 * 1024) + "Mb"));
            if (!_attachmentSettings.IsSupported(file.FileName)) return BadRequest("Invalid file type.");
            var uploadFolderPath = Path.Combine(_host.WebRootPath, "clientUploadedDocuments");
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
            var thumbNailFolderPath = Path.Combine(_host.WebRootPath, "clientUploadedThumbnail");
            if (!Directory.Exists(thumbNailFolderPath))
            {
                Directory.CreateDirectory(thumbNailFolderPath);
            }
            var thumbnailFileName = "thumbnail_" + fileName;
            var thumbnailFilePath = Path.Combine(thumbNailFolderPath, thumbnailFileName);
            var thumbnailImage = Image.FromFile(filePath);
            CreateAndSaveThumbnail(thumbnailImage, 100, thumbnailFilePath);
            var clientAttachment = new ClientUploadedImage
            {
                ClientUserProfileId = client.ClientUserProfile.Id,
                FileName = fileName,
                ThumbnailName = thumbnailFileName,
                DateCreated = DateTime.Now
            };
            _repository.AddDocumentAttachement(clientAttachment);
            _unitOfWork.GetAppDbContext().Entry(clientAttachment).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();

            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;            
            var log = new Log
            {
                LogInformation = $"{userName} uploaded client attachment document.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _repository.AddLog(log);
            _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            var attachments = await _repository.GetClientUploadedImages(client.ClientUserProfile.Id);
            var result = _mapper.Map<IEnumerable<ClientUploadedImage>, IEnumerable<ClientUploadedImageDTO>>(attachments);            
            return Ok(result);
        }

        [Authorize(Roles = "ClientUserRole")]
        [HttpDelete("/api/deleteClientAttachment/{fileName}")]
        public async Task<IActionResult> DeleteClientAttachment(string fileName)
        {
            var attachment = await _repository.GetClientUploadImage(fileName);
            if (attachment == null)
            {
                return NotFound("Resource not found!");
            }
            _repository.RemoveDocumentAttachement(attachment);
            _unitOfWork.GetAppDbContext().Entry(attachment).State = EntityState.Deleted;
            await _unitOfWork.CompletionAsync();
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;            
            var log = new Log
            {
                LogInformation = $"{userName} deleted client attachment.",
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _repository.AddLog(log);
            await _unitOfWork.CompletionAsync();
            return Ok();
        }


        //Client attachment methods
        [Authorize(Roles = "ClientUserRole")]
        [HttpGet("/api/clientUploadAttachments/")]
        public async Task<IActionResult> GetUploadedClientAttachments()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var client = await _repository.GetClientUserWithProfile(userId, _userManager);
            var attachments = await _repository.GetClientUploadedImages(client.ClientUserProfile.Id);
            if (attachments == null)
            {
                return NotFound("Resource not found, try again later");
            }
            var result = _mapper.Map<IEnumerable<ClientUploadedImage>, IEnumerable<ClientUploadedImageDTO>>(attachments);
            return Ok(result);
        }



        //Client attachment methods
        [Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/clientUploadAttachments/{userId}")]
        public async Task<IActionResult> GetUploadedClientAttachmentsByUserId(string userId)
        {            
            var client = await _repository.GetClientUserWithProfile(userId, _userManager);
            var attachments = await _repository.GetClientUploadedImages(client.ClientUserProfile.Id);
            if (attachments == null)
            {
                return NotFound("Resource not found, try again later");
            }
            var result = _mapper.Map<IEnumerable<ClientUploadedImage>, IEnumerable<ClientUploadedImageDTO>>(attachments);
            return Ok(result);
        }


        private void CreateAndSaveThumbnail(System.Drawing.Image image, int size, string thumbnailPath)
        {
            var thumbnailSize = GetThumbnailSize(image, size);
            using (var bitmap = ResizeImage(image, thumbnailSize.Width, thumbnailSize.Height))
            {
                bitmap.Save(thumbnailPath, ImageFormat.Jpeg);
                bitmap.Dispose();
            }
        }


        private static Size GetThumbnailSize(Image original, int size = 500)
        {
            var originalWidth = original.Width;
            var originalHeight = original.Height;
            double factor;
            if (originalWidth > original.Height)
            {
                factor = (double)size / originalWidth;
            }
            else
            {
                factor = (double)size / originalHeight;
            }
            return new Size((int)(originalWidth * factor), (int)(originalHeight * factor));
        }

        private Bitmap ResizeImage(Image image, int width, int height)
        {
            var result = new Bitmap(width, height);
            using (var graphics = Graphics.FromImage(result))
            {
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.DrawImage(image, 0, 0, result.Width, result.Height);
            }
            return result;
        }
    }
}
