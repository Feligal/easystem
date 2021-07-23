﻿using EASystem.Models.AuthenticationModels;
using EASystem.Models.ViewModels;
using Microsoft.AspNetCore.Identity;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    public class RoleEditModel
    {
        public IdentityRole  Role { get; set; }
        public IEnumerable<AppUser> Members { get; set; }
        public IEnumerable<AppUser> NonMembers { get; set; }
    }
}
