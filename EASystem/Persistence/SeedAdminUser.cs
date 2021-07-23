using EASystem.Models.AuthenticationModels;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Persistence
{
    public static class SeedAdminUser
    {
        public static async Task CreateAdminAccount(IApplicationBuilder app, IConfiguration configuration)
        {
            string securityStamp = Guid.NewGuid().ToString();
            string firstName = configuration["Data:AdminUser:FirstName"];
            string lastName = configuration["Data:AdminUser:LastName"];
            string email = configuration["Data:AdminUser:Email"];
            string password = configuration["Data:AdminUser:Password"];
            string role = configuration["Data:AdminUser:Role"];

            using (var scope = app.ApplicationServices.CreateScope())
            {
                var context = (AppDbContext)scope.ServiceProvider.GetService(typeof(AppDbContext));
                if (!context.Users.Any())
                {
                    var userManager = (UserManager<AppUser>)scope.ServiceProvider.GetService(typeof(UserManager<AppUser>));
                    var roleManager = (RoleManager<IdentityRole>)scope.ServiceProvider.GetService(typeof(RoleManager<IdentityRole>));
                    if (await userManager.FindByNameAsync($"{firstName}.{lastName}") == null)
                    {
                        AppUser user = new AppUser
                        {
                            SecurityStamp = securityStamp,
                            UserName = $"{firstName}.{lastName}",
                            Email = email,
                            EmailConfirmed = true,
                            LockoutEnabled = false,
                            AdminUserProfile = new AdminUserProfile
                            {
                                FirstName = firstName,
                                LastName = lastName,
                                UserName = $"{firstName}.{lastName}",
                            }
                        };
                        var adminUserRole = "AdminUserRole";
                        if (await roleManager.FindByNameAsync(adminUserRole) == null)
                        {
                            await roleManager.CreateAsync(new IdentityRole(adminUserRole));
                        }
                        var result = await userManager.CreateAsync(user, password);
                        if (await roleManager.FindByNameAsync(role) == null)
                        {
                            await roleManager.CreateAsync(new IdentityRole(role));
                        }
                        if (result.Succeeded)
                        {
                            await userManager.AddToRoleAsync(user, role);
                            await userManager.AddClaimAsync(user, new System.Security.Claims.Claim("Admins", "Admins"));
                        }
                        await context.SaveChangesAsync();
                    }
                }
            }
        }
    }
}
