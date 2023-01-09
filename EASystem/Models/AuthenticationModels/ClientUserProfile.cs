using EASystem.Models.ExamModels;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.AuthenticationModels
{
    public class ClientUserProfile
    {
        public int Id { get; set; }        
        public string FirstName { get; set; }
        public string UserName { get; set; }
        public string LastName { get; set; }
        public string OtherName { get; set; }
        public string Gender { get; set; }
        public DateTime Dob { get; set; }
        public string Nrc { get; set; }
        public bool Enabled { get; set; }        
        public string Phone { get; set; }
        public string Email { get; set; }        
        public string City { get; set; }
        public string Address { get; set; }
        public string PortraitImage { get; set; }
            
        public ICollection<ExamTaken> WrittenExams { get; set; }
        public ICollection<ClientApplication> ClientApplications { get; set; }
        public ICollection<ClientUploadedImage>ClientUploadedImages { get; set; }

        [ForeignKey("AppUserId")]
        public virtual AppUser AppUser { get; set; }
        public ClientUserProfile()
        {
            WrittenExams = new Collection<ExamTaken>();
            ClientApplications = new Collection<ClientApplication>();
            ClientUploadedImages = new Collection<ClientUploadedImage>();
        }
    }
}
