using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    public class ExamReview
    {
        public int Id { get; set; }
        public int ExamTakenId { get; set; }
        public  int QuestionId { get; set; }
        public string SelectedAnswer { get; set; }
        public DateTime DateTaken { get; set; }
    }
}
