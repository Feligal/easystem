using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class ClientUserViewModel
    {
        public ClientUserViewModel()
        {
        }
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Nrc { get; set; }
        public string PortraitImage { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
    }
}
