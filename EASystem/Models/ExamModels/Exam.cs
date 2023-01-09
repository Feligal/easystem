using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    public class Exam
    {
        public int Id { get; set; }
        public int ? DepartmentId { get; set; }
        public int PassMarkPercentage { get; set; }
        public string Name { get; set; }
        public DateTime DateCreated { get; set; }
        public ICollection<Report> ExamReports { get; set; }
        public ICollection<Question> Questions { get; set; }

        public Exam()
        {
            Questions = new Collection<Question>();
            ExamReports = new Collection<Report>();
        }

    }
}
