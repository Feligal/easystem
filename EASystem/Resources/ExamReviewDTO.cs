using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class ExamReviewDTO
    {
        public int Id { get; set; }
        public int ExamTakenId { get; set; }
        public int QuestionId { get; set; }
        public string SelectedAnswer { get; set; }
        public DateTime DateTaken { get; set; }
    }
}
