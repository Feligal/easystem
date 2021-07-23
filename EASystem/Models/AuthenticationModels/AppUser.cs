using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.AuthenticationModels
{
    public class AppUser: IdentityUser
    {
        public virtual AdminUserProfile AdminUserProfile { get; set; }
        public virtual ClientUserProfile ClientUserProfile { get; set; }
        public virtual List<Token> Tokens { get; set; }
    }
}
