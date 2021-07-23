using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class ClientUserProfileDTO
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
        //public EmploymentInfo EmploymentInfo { get; set; }        
        public ICollection<ExamTakenDTO> WrittenExams { get; set; }
        //public ICollection<ClientAttachment> ClientAttachments { get; set; }

        //public ICollection<ClientNotification> ClientNotifications { get; set; }
        //public ICollection<ClientPlotApplication> ClientPlotApplications { get; set; }


        public ClientUserProfileDTO()
        {
            WrittenExams = new Collection<ExamTakenDTO>();
            //    Plots = new Collection<Plot>();
            //    ClientNotifications = new Collection<ClientNotification>();
            //    ClientPlotApplications = new Collection<ClientPlotApplication>();
        }
    }
}
