using EASystem.Models.AuthenticationModels;
using EASystem.Persistence;
using EASystem.Models.ViewModels;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace EASystem.Controllers
{
    public class RoleAdminController:Controller
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<RoleAdminController> _logger;
        private readonly IAppRepository _repository;
        private readonly AppDbContext _context;
        //private readonly HttpContextAccessor _httpContextAccessor;
        public RoleAdminController(
            AppDbContext context ,
            IAppRepository repository,
            RoleManager<IdentityRole> roleManager, 
            UserManager<AppUser> userManager, 
            ILogger<RoleAdminController> logger
            //HttpContextAccessor httpContext
        )
        {
            _context = context;
            _repository = repository;
            _userManager = userManager;            
            _roleManager = roleManager;
            _logger = logger;
           // _httpContextAccessor = httpContext;
        }

        //[Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/assignrole/{id}")]
        public async Task<IActionResult> Edit(string id) 
        {
            IdentityRole role = await _roleManager.FindByIdAsync(id);
            var users = await _repository.GetAllUsers(_userManager);
            List<AppUser> members = new List<AppUser>();
            List<AppUser> nonMembers = new List<AppUser>();            
            foreach (AppUser user in users) {
                var list = await _userManager.IsInRoleAsync(user, role.Name) ? members : nonMembers;
                //User properties should not retain other sensitive informantion about the user                
                user.PasswordHash = "";
                user.SecurityStamp = "";
                user.ConcurrencyStamp = "";
                list.Add(user);
            }
            return Ok(new RoleEditModel
            {
                Role = role,
                Members = members,
                NonMembers = nonMembers
            });
        }

        //[Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/userroles")]
        public async Task<IActionResult> Edit([FromBody] RoleModificationModel model) {
            IdentityResult result;
            if (model != null) {
                foreach (string userId in model.IdsToAdd ?? new string[] { }) {
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user != null) {
                        result = await _userManager.AddToRoleAsync(user, model.RoleName);
                        if (!result.Succeeded) {
                            return BadRequest(result.Errors);
                        }
                    }
                }
                foreach (string userId in model.IdsToDelete ?? new string[] { })
                {
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user != null)
                    {
                        result = await _userManager.RemoveFromRoleAsync(user, model.RoleName);
                        if (!result.Succeeded)
                        {
                            return BadRequest(result.Errors);
                        }
                    }
                }
            }
            if (model != null) {               
                return Ok(new { message = "Successfully updated." });
            }
            else
            {
                return await Edit(model.RoleId);
            }
        }


        //[Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/getrolebyname/{roleName}")]
        public async Task<RoleUsersViewModel> GetRoleAndUsers(string roleName)
        {
            var role = await _repository.GetRoleByName(roleName,_roleManager);
            var users = await _repository.GetAllUsers(_userManager);
            var roleUser = new RoleUsersViewModel();            
            if (role != null)
            {               
                List<string> names = new List<string>();
                foreach (var user in users)
                {
                    if (user != null && await _userManager.IsInRoleAsync(user, role.Name))
                    {
                        names.Add(user.UserName);
                    }
                }
                roleUser.Id = 0;
                roleUser.Role = role;
                roleUser.UserNames = names;
                return roleUser;
            }
            return roleUser;
        }

        //[Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/getroles")]
        public async Task<IActionResult>  GetUserRoles() {
            List<RoleUsersViewModel> rolesUsers = new List<RoleUsersViewModel>();
            var roles = await _repository.GetUserRoles(_roleManager);
            var users = await _repository.GetAllUsers(_userManager);
            int index = 0;
            if (roles != null) {
                foreach (var role in roles) {
                    List<string> names = new List<string>();
                    foreach (var user in users) {
                        if (user != null && await _userManager.IsInRoleAsync(user, role.Name)) {
                            names.Add(user.UserName);
                        }
                    }
                    rolesUsers.Add(new RoleUsersViewModel
                    {
                        Id = index++,
                        Role = role,
                        UserNames = names
                    });
                }
                return Ok(rolesUsers);
            }
            return Ok(rolesUsers);
        }

        //[Authorize(Roles = "AdminUserRole")]
        [HttpPost("/api/createrole")]
        public async Task<IActionResult> CreateRole([FromBody] RoleViewModel model) {
            var role = await _repository.GetRoleByName(model.RoleName, _roleManager);
            //Check if the role exixts already
            if (role != null) {
                return BadRequest("Role name already exist, try again");
            }                       
            role = await _repository.CreateRole(model.RoleName, _roleManager);           
            return Ok(role);                     
        }
        [Authorize(Roles = "AdminUserRole")]
        [HttpDelete("/api/deleterole/{id}")]
        public async Task<IdentityRole> DeleteRole(string id) {
            var role = await _repository.DeleteRole(id, _roleManager);            
            return role;
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpGet("/api/getrole/{id}")]
        public async Task<IdentityRole> GetRole(string id) {
            var role = await _repository.GetRole(id, _roleManager);
            return role;
        }

        [Authorize(Roles = "AdminUserRole")]
        [HttpPut("/api/editrole/{id}")]
        public async Task<IActionResult> Edit(string id, [FromBody] RoleViewModel model) {
            if (model == null) { 
                return new StatusCodeResult(500); 
            }
            IdentityRole role = await _repository.GetRole(id, _roleManager);
            if (role != null) {
                role.Name = model.RoleName;
                IdentityResult result = await _roleManager.UpdateAsync(role);
                if (result.Succeeded) {                    
                    return Ok(role);
                }
            }
            return Ok(role);
        }
    }
}
