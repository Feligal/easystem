using EASystem.Models.AuthenticationModels;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Infrustracture
{
    public class CustomPasswordValidator: PasswordValidator<AppUser>
    {     
        public override async Task<IdentityResult> ValidateAsync(UserManager<AppUser> userManager, AppUser user, string password)
        {
            IdentityResult result = await base.ValidateAsync(userManager, user, password);
            List<IdentityError> errors = result.Succeeded ? new List<IdentityError>() : result.Errors.ToList();
            if (password.ToLower().Contains(user.UserName.ToLower()))
            {
                errors.Add(new IdentityError
                {
                    Code = "PasswordContainsUserName",
                    Description = "Password cannot contain username."
                });
            }
            if (password.Contains("1234"))
            {
                errors.Add(new IdentityError
                {
                    Code = "PasswordContainsSequence",
                    Description = "Password cannot contain numeric sequence"
                });
            }
            return errors.Count == 0 ? IdentityResult.Success : IdentityResult.Failed(errors.ToArray());
        }
    }    
}
