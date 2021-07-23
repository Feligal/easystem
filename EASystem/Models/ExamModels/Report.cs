using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    public class Report
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public string ExamName { get; set; }
        public int Score { get; set; }
        public string PassStatus { get; set; }
        public DateTime DateTaken { get; set; }
        public string ClientName { get; set; }
    }
}
