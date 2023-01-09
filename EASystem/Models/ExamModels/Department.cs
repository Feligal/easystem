using EASystem.Models.AuthenticationModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    public class Department
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<AdminUserProfile> AdminUserProfiles { get; set; }
        public ICollection<Exam> Exams { get; set; }

    }
}
