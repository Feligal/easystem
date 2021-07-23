using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class ResetPasswordViewModel
    {
        public ResetPasswordViewModel()
        {

        }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string  NewPassword { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string PasswordConfirm { get; set; }
        public string Token { get; set; }
    }
}
