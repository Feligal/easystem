using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class ExamDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime DateCreated { get; set; }
        public ICollection<ReportDTO> ExamReports { get; set; }
        public ICollection<QuestionDTO> Questions { get; set; }
        public ExamDTO()
        {
            ExamReports = new Collection<ReportDTO>();
            Questions = new Collection<QuestionDTO>();
        }
    }

}
