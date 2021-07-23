using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class ClientEmailViewModel
    {
        public ClientEmailViewModel()
        {}
        [Required]
        public string Username { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Message { get; set; }
    }
}
