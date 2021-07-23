using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class PasswordChangeViewModel
    {
        public PasswordChangeViewModel()
        {

        }
        public string  Id { get; set; }
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string PasswordConfirm { get; set; }

    }
}
