using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class AdminUserModel
    {
        public AdminUserModel(){}
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string  Email { get; set; }
        public string  Password { get; set; }
    }
}
