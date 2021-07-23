using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class ForgotPasswordViewModel
    {
        public ForgotPasswordViewModel()
        {

        }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
