using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.AuthenticationModels
{
    public class AdminUserProfile
    {
        public int Id { get; set; }
        public int ? DepartmentId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public bool Enabled { get; set; }
        [ForeignKey("AppUserId")]
        public virtual AppUser AppUser { get; set; }
        public AdminUserProfile()
        {

        }
    }
}
