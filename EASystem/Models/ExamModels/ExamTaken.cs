using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    [Table("ExamTaken")]
    public class ExamTaken
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int Duration { get; set; }
        public int NumberOfQuestions { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public  int ? ClientUserProfileId { get; set; }
        public DateTime DateTaken { get; set; }
        public DateTime DateAdded { get; set; }
        public int Score { get; set; }
        public string PassStatus { get; set; }        
        public bool HasBeenTaken { get; set; } = false;

    }
}
