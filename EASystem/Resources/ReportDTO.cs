using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class ReportDTO
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public string ExamName { get; set; }
        public int Score { get; set; }
        public int MarksScored { get; set; }
        public int PassMarkPercentage { get; set; }
        public int TotalNumberOfQuestions { get; set; }
        public string PassStatus { get; set; }
        public DateTime DateTaken { get; set; }
        public string ClientName { get; set; }
        public string UserPhoneNumber { get; set; }
        public string UserEmail { get; set; }
        public int? DepartmentId { get; set; }
    }
}
