using AutoMapper;
using EASystem.Extensions;
using EASystem.Models.AuthenticationModels;
using EASystem.Models.HelperModels;
using EASystem.Models.ViewModels;
using EASystem.Persistence;
using EASystem.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace EASystem.Controllers
{
    public class AdminController: Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AppDbContext _identityContext;
        private readonly IPasswordHasher<AppUser> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly IPasswordValidator<AppUser> _passwordValidator;
        private readonly IUserValidator<AppUser> _userValidator;
        private readonly ILogger<AdminController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAppRepository _repository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailSender _emailSender;

        public class ConfirmationData
        {
            public string email { get; set; }
            public string token { get; set; }
        }

        public AdminController(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole> roleManager,
            AppDbContext context,
            IPasswordHasher<AppUser> passwordHasher,
            IConfiguration configuration,
            IPasswordValidator<AppUser> passwordValidator,
            IUserValidator<AppUser> userValidator,
            ILogger<AdminController> logger,
            IHttpContextAccessor httpContextAccessor,
            IAppRepository repository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IEmailSender emailSender
            )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _identityContext = context;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _passwordValidator = passwordValidator;
            _userValidator = userValidator;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _repository = repository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _emailSender = emailSender;
        }

        [HttpGet("/api/admins")]
        [Authorize(Roles = "AdminUserRole")]
        public async Task<IActionResult> GetAdminUsers()
        {
            var adminUsers = await _repository.GetAllAdminUsers(_userManager);
            List<AdminUserViewModel> adminModel = new List<AdminUserViewModel>();
            if (adminUsers != null)
            {
                foreach (var admin in adminUsers)
                {
                    var adminUser = new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    };
                    adminModel.Add(adminUser);
                }
                return Ok(_mapper.Map<IEnumerable<AdminUserViewModel>, IEnumerable<AdminUserViewModelDTO>>(adminModel));
            }
            return Ok(adminModel);
        }

        [HttpGet("/api/departmentusers/{departmentId}")]
        [Authorize(Roles = "AdminUserRole")]
        public async Task<IActionResult> GetDepatmentAdminUsers(int departmentId)
        {
            var adminUsers = await _repository.GetAllAdminUsersByDepartmentId(_userManager, departmentId);
            List<AdminUserViewModel> adminModel = new List<AdminUserViewModel>();
            if (adminUsers != null)
            {
                foreach (var admin in adminUsers)
                {
                    var adminUser = new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    };
                    adminModel.Add(adminUser);
                }
                return Ok(_mapper.Map<IEnumerable<AdminUserViewModel>, IEnumerable<AdminUserViewModelDTO>>(adminModel));
            }
            return Ok(adminModel);
        }

        [HttpPost("/api/adddepartmentusers/{departmentId}")]
        [Authorize(Roles = "AdminUserRole")]
        public async Task<IActionResult> AddAdminsToDepartment(int departmentId, [FromBody] List<string> selectedIds)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            foreach (var userId in selectedIds) {
                var adminUser = await _repository.GetAdminUserWithProfile(userId, _userManager);
                adminUser.AdminUserProfile.DepartmentId = departmentId;
                await _unitOfWork.CompletionAsync();
            }
            List<AdminUserViewModel> adminModel1 = new List<AdminUserViewModel>();
            List<AdminUserViewModel> adminModel2 = new List<AdminUserViewModel>();
            
            var adminUsers1 = await _repository.GetAllAdminUsersByDepartmentId(_userManager, departmentId);
            if (adminUsers1 != null)
            {
                foreach (var admin in adminUsers1)
                {                    
                    adminModel1.Add(new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    });
                }
            }
            var adminUsers2 = await _repository.GetAllAdminUsersNoDepartment(_userManager);
            if (adminUsers2 != null)
            {
                foreach (var admin in adminUsers2)
                {                    
                    adminModel2.Add(new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    });
                }
            }
            return Ok(
                new { 
                    users1 = adminModel1,
                    users2 = adminModel2,
                }
            );
        }

        [HttpPost("/api/removedepartmentusers/{departmentId}")]
        [Authorize(Roles = "AdminUserRole")]
        public async Task<IActionResult> RemoveAdminsToDepartment(int departmentId, [FromBody] List<string> selectedIds)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            foreach (var userId in selectedIds)
            {
                var adminUser = await _repository.GetAdminUserWithProfile(userId, _userManager);
                adminUser.AdminUserProfile.DepartmentId = null;
                await _unitOfWork.CompletionAsync();
            }
            List<AdminUserViewModel> adminModel1 = new List<AdminUserViewModel>();
            List<AdminUserViewModel> adminModel2 = new List<AdminUserViewModel>();

            var adminUsers1 = await _repository.GetAllAdminUsersByDepartmentId(_userManager, departmentId);
            if (adminUsers1 != null)
            {
                foreach (var admin in adminUsers1)
                {
                    adminModel1.Add(new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    });
                }
            }
            var adminUsers2 = await _repository.GetAllAdminUsersNoDepartment(_userManager);
            if (adminUsers2 != null)
            {
                foreach (var admin in adminUsers2)
                {
                    adminModel2.Add(new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    });
                }
            }
            return Ok(new
                {
                    users1 = adminModel1,
                    users2 = adminModel2,
                }
            );
        }


        [HttpGet("/api/nodepartmentusers/")]
        [Authorize(Roles = "AdminUserRole")]
        public async Task<IActionResult> GetNoDepatmentAdminUsers()
        {
            var adminUsers = await _repository.GetAllAdminUsersNoDepartment(_userManager);
            List<AdminUserViewModel> adminModel = new List<AdminUserViewModel>();
            if (adminUsers != null)
            {
                foreach (var admin in adminUsers)
                {
                    var adminUser = new AdminUserViewModel
                    {
                        Id = admin.Id,
                        FirstName = admin.AdminUserProfile.FirstName,
                        LastName = admin.AdminUserProfile.LastName,
                        Email = admin.Email.ToLower(),
                        UserName = admin.UserName
                    };
                    adminModel.Add(adminUser);
                }
                return Ok(_mapper.Map<IEnumerable<AdminUserViewModel>, IEnumerable<AdminUserViewModelDTO>>(adminModel));
            }
            return Ok(adminModel);
        }


        [Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/departments/{departmentId}")]
        public async Task<IActionResult> GetDepartmentById(int departmentId) {
            var department = await _repository.GetDepartment(departmentId);
            if (department == null) {
                return NotFound("Department not found");
            }
            return Ok(department);
        }


        [Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/clients")]
        public async Task<IActionResult> GetClientUsers()
        {
            var clientUsers = await _repository.GetAllClientUsers(_userManager);
            List<ClientUserViewModel> clientModel = new List<ClientUserViewModel>();
            if (clientUsers != null)
            {
                foreach (var client in clientUsers)
                {
                    var clientUser = new ClientUserViewModel
                    {
                        Id = client.Id,
                        FirstName = client.ClientUserProfile.FirstName,
                        LastName = client.ClientUserProfile.LastName,
                        Gender = client.ClientUserProfile.Gender,
                        PortraitImage = client.ClientUserProfile.PortraitImage,
                        Email = client.Email.ToLower(),
                        UserName = client.UserName,
                        Is2FactorEnabled = client.TwoFactorEnabled
                    };
                    clientModel.Add(clientUser);
                }
                return Ok(clientModel);
            }
            return Ok(clientModel);
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/admin")]
        public async Task<IActionResult> CreateAdminUser([FromBody] AdminUserViewModel model)
        {
            if (model == null) return new StatusCodeResult(500);
            AppUser user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null)
            {
                return BadRequest("Another user with that email address already exists. Try another email.");
            }
            user = new AppUser
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                EmailConfirmed = true,
                LockoutEnabled = false,
                AdminUserProfile = new AdminUserProfile
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    UserName = model.UserName
                }
            };
            var adminUserRole = "AdminUserRole";
            if (await _roleManager.FindByNameAsync(adminUserRole) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(adminUserRole));
            }
            var result = await _userManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                result = await _userManager.AddToRoleAsync(user, adminUserRole);
                await _userManager.AddClaimAsync(user, new Claim("Admins", "Admins"));
            }
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            //Add a custom log system
            var log = new Log
            {
                LogInformation = "Created Admin User " + user.UserName,
                DateCreated = DateTime.Now,
                Owner = userName
            };
            _repository.AddLog(log);
            _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;

            await _unitOfWork.CompletionAsync();
            _identityContext.SaveChanges();
            return Ok(new { userName = user.UserName });
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/admin/{id}")]
        public async Task<IActionResult> GetAdminUser(string id)
        {
            var adminProfile = await _repository.GetAdminUserWithProfile(id, _userManager);
            if (adminProfile == null) { return NotFound(); }
            var admin = new AdminUserViewModel();
            admin.Id = adminProfile.Id;
            admin.Email = adminProfile.Email.ToLower();
            admin.FirstName = adminProfile.AdminUserProfile.FirstName;
            admin.LastName = adminProfile.AdminUserProfile.LastName;
            admin.UserName = adminProfile.UserName;
            admin.Password = "";
            admin.PhoneNumber = adminProfile.PhoneNumber;
            var result = _mapper.Map<AdminUserViewModel, AdminUserViewModelDTO>(admin);
            return Ok(result);
        }

        [Authorize(Roles = "AdminUserRole,ClientUserRole")]
        [HttpGet("/api/client/{id}")]
        public async Task<IActionResult> GetClientUser(string id)
        {
            var clientProfile = await _repository.GetClientUserWithProfile(id, _userManager);
            if (clientProfile == null)
            {
                return NotFound();
            }
            var client = new ClientUserViewModel
            {
                Id = clientProfile.Id,
                Email = clientProfile.Email.ToLower(),
                FirstName = clientProfile.ClientUserProfile.FirstName,
                LastName = clientProfile.ClientUserProfile.LastName,
                Nrc = clientProfile.ClientUserProfile.Nrc,
                UserName = clientProfile.UserName,
                Gender = clientProfile.ClientUserProfile.Gender,
                PortraitImage = clientProfile.ClientUserProfile.PortraitImage,
                Password = "",
                PhoneNumber = clientProfile.PhoneNumber
            };
            return Ok(client);
        }


        [Authorize(Roles = "AdminUserRole,ClientUserRole")]
        [HttpGet("/api/clientusername/{username}")]
        public async Task<IActionResult> GetClientUserByUsername(string username)
        {
            var clientProfile = await _repository.GetClientUserWithProfileByUsername(username, _userManager);
            if (clientProfile.ClientUserProfile == null)
            {
                return NotFound();
            }
           
            var client = new ClientUserViewModel
            {
                Id = clientProfile.Id,
                Email = clientProfile.Email.ToLower(),
                FirstName = clientProfile.ClientUserProfile.FirstName,
                LastName = clientProfile.ClientUserProfile.LastName,
                Nrc = clientProfile.ClientUserProfile.Nrc,
                UserName = clientProfile.UserName,
                Gender = clientProfile.ClientUserProfile.Gender,
                PortraitImage = clientProfile.ClientUserProfile.PortraitImage,
                Password = "",
                PhoneNumber = clientProfile.PhoneNumber
            };
            return Ok(client);
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpPut("/api/admin/{id}")]
        public async Task<IActionResult> EditAdminUser([FromBody] AdminUserViewModel model, string id)
        {
            if (model == null)
            {
                return new StatusCodeResult(500);
            }
            AppUser user = await _repository.GetAdminUserWithProfile(id, _userManager);
            if (user != null)
            {
                user.UserName = model.UserName;
                user.PhoneNumber = model.PhoneNumber;
                user.Email = model.Email;
                IdentityResult validPass = null;
                if (!string.IsNullOrEmpty(model.Password))
                {
                    validPass = await _passwordValidator.ValidateAsync(_userManager, user, model.Password);
                    if (validPass.Succeeded)
                    {
                        user.PasswordHash = _passwordHasher.HashPassword(user, model.Password);
                        user.AdminUserProfile.FirstName = model.FirstName;
                        user.AdminUserProfile.LastName = model.LastName;
                        user.AdminUserProfile.UserName = model.UserName;
                    }
                    else
                    {
                        return Ok(validPass.Errors.ToArray());
                    }
                }
                if (validPass == null || (model.Password != string.Empty && validPass.Succeeded))
                {
                    IdentityResult result = await _userManager.UpdateAsync(user);
                    if (result.Succeeded)
                    {
                        var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                        //Add a custom log system
                        var log = new Log
                        {
                            LogInformation = "Edited Admin User Information for " + user.UserName,
                            DateCreated = DateTime.Now,
                            Owner = userName
                        };
                        _repository.AddLog(log);
                        _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                        await _unitOfWork.CompletionAsync();
                        return Ok(new { successMessage = user.UserName + " was successfully updated" });
                    }
                    else
                    {
                        return Ok(result.Errors.ToArray());
                    }
                }

            }
            return Ok(new { Message = "Username not found." });
        }

        [Authorize(Roles = "AdminUserRole,ClientUserRole")]
        [HttpPut("/api/client/{id}")]
        public async Task<IActionResult> EditClientUser([FromBody] ClientUserViewModel model, string id)
        {
            if (model == null)
            {
                return new StatusCodeResult(500);
            }
            AppUser user = await _repository.GetClientUserWithProfile(id, _userManager);
            if (user != null)
            {
                user.UserName = model.UserName;
                user.PhoneNumber = model.PhoneNumber;
                user.Email = model.Email;
                user.ClientUserProfile.FirstName = model.FirstName;
                user.ClientUserProfile.LastName = model.LastName;
                user.ClientUserProfile.UserName = model.UserName;
                user.ClientUserProfile.Nrc = model.Nrc;
                user.ClientUserProfile.Gender = model.Gender;
                user.ClientUserProfile.Phone = model.PhoneNumber;

                //IdentityResult validPass = null;
                //if (!string.IsNullOrEmpty(model.Password))
                //{
                //    validPass = await _passwordValidator.ValidateAsync(_userManager, user, model.Password);
                //    if (validPass.Succeeded)
                //    {
                //        //user.PasswordHash = _passwordHasher.HashPassword(user, model.Password);
                //        user.ClientUserProfile.FirstName = model.FirstName;
                //        user.ClientUserProfile.LastName = model.LastName;
                //        user.ClientUserProfile.UserName = model.UserName;
                //        user.ClientUserProfile.Nrc = model.Nrc;
                //        user.ClientUserProfile.Gender = model.Gender;
                //        user.ClientUserProfile.Phone = model.PhoneNumber;
                //    }
                //    else
                //    {
                //        return Ok(validPass.Errors.ToArray());
                //    }
                //}
                //if (validPass == null || (model.Password != string.Empty && validPass.Succeeded))
                //{
                    IdentityResult result = await _userManager.UpdateAsync(user);
                    if (result.Succeeded)
                    {
                        var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                        //Add a custom log system
                        var log = new Log
                        {
                            LogInformation = "Edited Client User Information for " + user.UserName,
                            DateCreated = DateTime.Now,
                            Owner = userName
                        };
                        _repository.AddLog(log);
                        _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                        await _unitOfWork.CompletionAsync();

                        return Ok(new { successMessage = user.UserName + " was successfully updated" });
                    }
                    else
                    {
                        return Ok(result.Errors.ToArray());
                    }
                //}

            }
            return Ok(new { Message = "Username not found." });
        }

        [Authorize(Roles = "AdminUserRole,ClientUserRole")]
        [HttpPut("/api/changePassword/{id}")]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] PasswordChangeViewModel model)
        {
            if (model == null) { return new StatusCodeResult(500); }
            if (id != model.Id)
            {
                return BadRequest();
            }
            AppUser user = await _repository.GetIdentityUser(id, _userManager);
            var currentUsername = _httpContextAccessor.HttpContext.User.Identity.Name;
            if (user != null)
            {
                IdentityResult validPass = null;
                if (!string.IsNullOrEmpty(model.CurrentPassword))
                {
                    if (await _userManager.CheckPasswordAsync(user, model.CurrentPassword))
                    {
                        validPass = await _passwordValidator.ValidateAsync(_userManager, user, model.NewPassword);
                        if (validPass.Succeeded)
                        {
                            user.PasswordHash = _passwordHasher.HashPassword(user, model.NewPassword);
                            IdentityResult result = await _userManager.UpdateAsync(user);
                            if (result.Succeeded)
                            {
                                //Add a custom log system
                                var log = new Log
                                {
                                    LogInformation = "User changed the password.",
                                    DateCreated = DateTime.Now,
                                    Owner = currentUsername
                                };
                                _repository.AddLog(log);
                                _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                                await _unitOfWork.CompletionAsync();
                                return Ok(new { message = "Password changed successfully." });
                            }
                            else
                            {
                                //Add a custom log system
                                var log = new Log
                                {
                                    LogInformation = "User attempted to change the password but failed.",
                                    DateCreated = DateTime.Now,
                                    Owner = currentUsername
                                };
                                _repository.AddLog(log);
                                _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                                await _unitOfWork.CompletionAsync();
                                return Ok(result.Errors.ToArray());
                            }
                        }
                        else
                        {
                            //Add a custom log system
                            var log = new Log
                            {
                                LogInformation = "User attempted to change the password but failed.",
                                DateCreated = DateTime.Now,
                                Owner = currentUsername
                            };
                            _repository.AddLog(log);
                            _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;

                            await _unitOfWork.CompletionAsync();
                            return Ok(validPass.Errors.ToArray());
                        }
                    }
                    else
                    {
                        //Add a custom log system
                        var log = new Log
                        {
                            LogInformation = "User attempted to change the password but failed.",
                            DateCreated = DateTime.Now,
                            Owner = currentUsername
                        };
                        _repository.AddLog(log);
                        _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                        await _unitOfWork.CompletionAsync();
                        return Ok(new { wrongPass = "Current password is incorrect , please try again." });
                    }
                }
            }
            return Ok(new { message = "Username not found." });
        }


        [Authorize(Roles = "AdminUserRole")]
        [HttpDelete("/api/deleteclient/{userId}")]
        public async Task<IActionResult> DeleteClientUser(string userId)
        {
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            AppUser user = await _repository.GetClientUserByUserId(userId, _userManager);
            if (user != null)
            {
                IdentityResult result = await _userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    //_repository.DeleteClientUserProfile(user.ClientUserProfile);
                    var log = new Log
                    {
                        LogInformation = $"Deleted Client User - {user.UserName}.",
                        DateCreated = DateTime.Now,
                        Owner = userName
                    };
                    _repository.AddLog(log);
                    _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    return Ok(user);
                }
                else
                {
                    var log = new Log
                    {
                        LogInformation = "Attempted to deleted Client user but failed.",
                        DateCreated = DateTime.Now,
                        Owner = userName
                    };
                    _repository.AddLog(log);
                    _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    return BadRequest("Delete operation failed.");
                }
            }
            else
            {
                return NotFound("Username not found.");
            }
        }

        //[Authorize(Roles = "AdminUserRole")]
        [HttpDelete("/api/admin/{id}")]
        public async Task<IActionResult> DeleteAdminUser(string id)
        {
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            AppUser user = await _repository.GetAdminUserWithProfile(id, _userManager);
            if (user != null)
            {
                IdentityResult result = await _userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    var log = new Log
                    {
                        LogInformation = "Deleted Admin user.",
                        DateCreated = DateTime.Now,
                        Owner = userName
                    };
                    _repository.AddLog(log);
                    _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    return Ok(new { userName = user.UserName });
                }
                else
                {
                    var log = new Log
                    {
                        LogInformation = "Attempted to deleted Admin user but failed.",
                        DateCreated = DateTime.Now,
                        Owner = userName
                    };
                    _repository.AddLog(log);
                    _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                    await _unitOfWork.CompletionAsync();
                    return Ok(new { Message = "Delete operation failed." });
                }
            }
            else
            {
                return Ok(new { Message = "Username not found." });
            }
        }


        ////[Authorize(Roles = "AdminUserRole,AerodromeClientRole")]
        //[HttpGet("/api/getAerodromeClient/{username}")]
        //public async Task<IActionResult> GetOperatorProfileByUsername(string username)
        //{
        //    if (String.IsNullOrEmpty(username))
        //    {
        //        return BadRequest();
        //    }
        //    var userProfole = await _repository.GetOperatorUserProfileByUserName(username);
        //    if (userProfole == null)
        //    {
        //        return NotFound();
        //    }
        //    var result = _mapper.Map<OperatorUserProfile, OperatorUserProfileDTO>(userProfole);
        //    return Ok(result);
        //}

        //[Authorize(Roles = "AdminUserRole,AerodromeClientRole")]
        [HttpGet("/api/getOperatorAerodrome/{id}")]
        //public async Task<IActionResult> GetAerodromesByOperatorId(int id)
        //{
        //    var aerodromes = await _repository.GetAerodromesByOperatorId(id);
        //    if (aerodromes == null)
        //    {
        //        return NotFound("Resources not found");
        //    }
        //    return Ok(aerodromes);
        //}

        //[Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/operatorUsers/{operatorId}")]
        //public async Task<IActionResult> GetOperatorUsers(int operatorId)
        //{
        //    //Return only basic profile information
        //    List<OperatorUserViewModel> operatorUsers = new List<OperatorUserViewModel>();
        //    var users = await _repository.GetAllOperatorUsers(operatorId, _userManager);
        //    if (users != null)
        //    {
        //        foreach (var item in users)
        //        {
        //            if (item.OperatorUserProfile != null)
        //            {
        //                var client = new OperatorUserViewModel
        //                {
        //                    Id = item.OperatorUserProfile.Id,
        //                    UserName = item.UserName,
        //                    Email = item.OperatorUserProfile.Email,
        //                    FirstName = item.OperatorUserProfile.FirstName,
        //                    LastName = item.OperatorUserProfile.LastName,
        //                    Password = "",
        //                    PhoneNumber = item.OperatorUserProfile.Phone
        //                };
        //                operatorUsers.Add(client);
        //            }
        //        }
        //        return Ok(operatorUsers);
        //    }
        //    return Ok(operatorUsers);
        //}


        //[Authorize(Roles = "AdminUserRole")]
        //[HttpGet("/api/getOperatorUser/{userId}")]
        //public async Task<IActionResult> GetOperatorUser(int userId)
        //{
        //    //Return only basic profile information            
        //    var user = await _repository.GetOperatorUserById(userId, _userManager);
        //    if (user != null)
        //    {
        //        return Ok(user);
        //    }
        //    return Ok(user);
        //}

        
        private void AddErrorsFromResult(IdentityResult result)
        {
            foreach (IdentityError error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }
        }

        //Does not need a authorize attribute to be applied 
        [AllowAnonymous]
        [HttpPost("/api/confirmEmail/")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmationData data)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await _userManager.FindByEmailAsync(data.email);
            if (user == null)
                return NotFound("User not found");

            var result = await _userManager.ConfirmEmailAsync(user, data.token);
            
            if (!result.Succeeded)
            {
                return Ok(new { message = "Error ocurred while confirming the account." });
            }
            return Ok(new { message = "Account Successfully confirmed." });
        }



        //TWO FACTOR AUTHENTICATION METHODS
        [Authorize(Roles = "AdminUserRole,ReadOnly,ClientUserRole")]
        [HttpPost("/api/enable2Factorverification/")]
        public async Task<IActionResult> ChangeTwoFactorAuthentication([FromBody] AuthTagViewModel authTag)
        {
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userName);
            var result = await _userManager.SetTwoFactorEnabledAsync(user, authTag.Enable2Factor);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Success" });
            }
            else
            {
                return Ok(new { Message = "Error" });
            }
        }

        //TWO FACTOR AUTHENTICATION METHODS
        [Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/enable2Factorverification/{userId}")]
        public async Task<IActionResult> AdminChangeTwoFactorAuthentication(string userId, [FromBody] AuthTagViewModel authTag)
        {            
            var user = await _userManager.FindByIdAsync(userId);
            var result = await _userManager.SetTwoFactorEnabledAsync(user, authTag.Enable2Factor);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Success" });
            }
            else
            {
                return BadRequest("2FA Update failed.");
            }
        }


        [Authorize(Roles = "AdminUserRole,ReadOnly,ClientUserRole")]
        [HttpGet("/api/twofactorverification/")]
        public async Task<IActionResult> GetTwoFactorAuthentication()
        {
            var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userName);
            var isTwoFactor = await _userManager.GetTwoFactorEnabledAsync(user);
            return Ok(new { IsTwoFactor = isTwoFactor });
        }

        //#################################################


        [AllowAnonymous]
        [HttpPost("/api/forgotPassword/")]

        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid model, try again.");
            }
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.IsEmailConfirmedAsync(user))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResetLink = Url.Action(nameof(ResetPassword), "login", values: new { token, email = user.Email }, Request.Scheme, Request.Host.ToString());
                //SEND EMAIL TO SYSTEM USER EMAIL TO THE CLIENT
                string fromEmail = _configuration["EmailSettings:Sender"];
                string toEmail = user.Email;
                string subject = "Password Reset Notification.";
                string body = $"Please reset your password by <a href='{HtmlEncoder.Default.Encode(passwordResetLink)}'><b>Clicking Here</b></a>.";
                await _emailSender.SendEmail(fromEmail, toEmail, subject, body);
                return Ok(new { Message = " Reset was successful!" });
            }
            else
            {
                return Ok(new { Message = "An error occured during reset, try again" });
            }
        }

        [AllowAnonymous]
        [HttpPost("/api/resetPassword/")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return NotFound("User not found");
            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.PasswordConfirm);
            if (!result.Succeeded)
            {
                return Ok(new { message = "Error ocurred while reseting password." });
            }
            var log = new Log
            {
                LogInformation = $"Successful password reset for { user.UserName}",
                DateCreated = DateTime.Now,
                Owner = "System"
            };
            _repository.AddLog(log);
            _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
            await _unitOfWork.CompletionAsync();
            return Ok(new { message = "Password Successfully Reset." });
        }


        [AllowAnonymous]
        [HttpPost("/api/registerClient")]
        public async Task<IActionResult> RegisterClientUser([FromBody] ClientUserViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            //Check if the username/email address already exits
            AppUser user = await _userManager.FindByNameAsync(model.UserName);
            if (user != null)
            {
                return BadRequest($"{model.UserName} already exists, try to use a different");
            }

            user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null)
            {
                return BadRequest($"Another user with that email address {model.Email} already exists.");
            }
            user = new AppUser
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Email = model.Email,
                //EmailConfirmed = false,
                LockoutEnabled = false,
                PhoneNumber = model.PhoneNumber,
                ClientUserProfile = new ClientUserProfile
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    UserName = model.UserName,
                    Gender = model.Gender,
                    Phone = model.PhoneNumber,
                    Email = model.Email,
                    Nrc = model.Nrc
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
                //Set two factor authentication
                await _userManager.SetTwoFactorEnabledAsync(user, true);

                var company = await _repository.GetCompanyInfos();
                var companyInfo = company.ToList()[0];
                result = await _userManager.AddToRoleAsync(user, clientUserRole);
                await _userManager.AddClaimAsync(user, new Claim("Clients", "Clients"));
                _identityContext.SaveChanges();
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var confirmationLink = Url.Action(nameof(ConfirmEmail), "login", values: new { token, email = user.Email }, Request.Scheme, Request.Host.ToString());

                //SEND EMAIL TO SYSTEM USER EMAIL TO THE CLIENT
                string fromEmail = _configuration["EmailSettings:Sender"];
                string toEmail = user.Email;
                string subject = $"{companyInfo.Aliase} - Email Confirmation.";
                string body = $"Dear Esteemed Customer, <br/>Please confirm your account by <a href='{HtmlEncoder.Default.Encode(confirmationLink)}'><b>Clicking here.</b></a>.";
                await _emailSender.SendEmail(fromEmail, toEmail, subject, body);

                // SEND EMAIL TO SYSTEM USER EMAILS
                //TO BE ENABLED LATER %%%%%%%%%%%%%%%%%%%%%
                fromEmail = _configuration["EmailSettings:Sender"];
                toEmail = _configuration["Data:AdminUser:Email"];
                subject = $"{companyInfo.Aliase} - Client Registration.";
                body = $"{user.UserName}  has been registered as client on the system. <br/> Kind regards, <br/> {companyInfo.Aliase} Admin";
                await _emailSender.SendEmail(fromEmail, toEmail, subject, body);
                //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
                //Saving the notification in as notification     
                var newNotification = new Notification
                {
                    Title = $"Client Registration at {DateTime.Now}",
                    Notice = $"This serves to inform you that a new client has been registered on the system.",
                    Source = "System",
                    IsOpened = false,
                    DateOfNotification = DateTime.Now
                };
                _repository.AddNotification(newNotification);
                _unitOfWork.GetAppDbContext().Entry(newNotification).State = EntityState.Added;
                var newLog = new Log
                {
                    LogInformation = $"Client {user.UserName} registered on system.",
                    DateCreated = DateTime.Now,
                    Owner = "System"
                };
                _repository.AddLog(newLog);
                _unitOfWork.GetAppDbContext().Entry(newLog).State = EntityState.Added;
                await _unitOfWork.CompletionAsync();
            }
            else
            {
                AddErrorsFromResult(result);
                return BadRequest(ModelState);
            }
            return Ok(new { Message = user.UserName + " was created successfully!" });
        }


        [Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/clientUser")]
        public async Task<IActionResult> CreateClientUser([FromBody] ClientUserViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            //Check if the username/email address already exits
            AppUser user = await _userManager.FindByNameAsync(model.UserName);
            if (user != null)
            {
                return BadRequest("Username already exists, try to use a different one.");
            }
            user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null)
            {
                return BadRequest("Another user with that email address already exists, try to use a diffent one.");
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
                    Gender = model.Gender,
                    Phone = model.PhoneNumber,
                    Email = model.Email,   
                    Nrc = model.Nrc
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
                result = await _userManager.AddToRoleAsync(user, clientUserRole);
                await _userManager.AddClaimAsync(user, new Claim("ClientUser", "ClientUser"));
                _identityContext.SaveChanges();
                var userName = _httpContextAccessor.HttpContext.User.Identity.Name;
                var log = new Log
                {
                    LogInformation = $"Created Client User account for {user.UserName} ",
                    DateCreated = DateTime.Now,
                    Owner = userName
                };
                _repository.AddLog(log);
                _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Added;
                await _unitOfWork.CompletionAsync();
            }
            else
            {
                return Ok(result.Errors);
            }
            return Ok(new { Message = user.UserName + " was created successfully!" });
        }


       

        //Logs operational related functions
        [Authorize(Roles = "AdminUserRole,ReadOnly")]
        [HttpGet("/api/logactions")]
        public async Task<IActionResult> GetAllLogInformation()
        {
            var logs = await _repository.GetLogs();
            if (logs == null)
            {
                return NotFound("Resource not found, try again");
            }
            var result = _mapper.Map<IEnumerable<Log>, IEnumerable<LogDTO>>(logs);
            return Ok(result);
        }


        [Authorize(Roles = "AdminUserRole")]
        [HttpDelete("/api/deletelog/{id}")]
        public async Task<IActionResult> DeleteLogFile(int id)
        {
            var log = await _repository.GetLogById(id);
            if (log == null)
            {
                return NotFound("Resource not found, try again");
            }
            _repository.RemoveLog(log);
            _unitOfWork.GetAppDbContext().Entry(log).State = EntityState.Deleted;
            await _unitOfWork.CompletionAsync();
            var result = _mapper.Map<Log, LogDTO>(log);
            return Ok(result);
        }

    }
}
