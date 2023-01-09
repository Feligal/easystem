using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
        public DateTime TimeStarted { get; set; }
        public DateTime TimeFinished { get; set; }
        public double TimeTakenToWrite { get; set; }
        public string ExamTime { get; set; }
        public int? DepartmentId { get; set; }

        public int NumberOfQuestions { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string UserPhoneNumber { get; set; }
        public string UserEmail { get; set; }       
        public string UserId { get; set; }
        public  int ? ClientUserProfileId { get; set; }
        public DateTime DateTaken { get; set; }
        public DateTime DateAdded { get; set; }
        public DateTime ScheduledDate { get; set; }
        public double Score { get; set; }
        public int MarksScored { get; set; }
        public string PassStatus { get; set; }
        public int PassMarkPercentage { get; set; }
        public bool HasBeenTaken { get; set; } = false;
        public bool IsActivated { get; set; } = false;
        public ICollection<ExamReview> ExamReviews { get; set; }
        public ExamTaken()
        {
            ExamReviews = new Collection<ExamReview>();
        }
    }
}
