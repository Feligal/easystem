using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class RoleUsersViewModel
    {
        public RoleUsersViewModel()
        {

        }

        public int Id { get; set; }
        public List<string> UserNames { get; set; }
        public IdentityRole Role{ get; set; }

    }
}
