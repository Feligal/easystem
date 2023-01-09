using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class ExamTakenDTO
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int Duration { get; set; }
        public DateTime TimeStarted { get; set; }
        public DateTime TimeFinished { get; set; }
        public string ExamTime { get; set; }
        public int? DepartmentId { get; set; }
        public double TimeTakenToWrite { get; set; }
        public int NumberOfQuestions { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string UserPhoneNumber { get; set; }        
        public string UserEmail { get; set; }
        public int MarksScored { get; set; }
        public string UserId { get; set; }
        public int? ClientUserProfileId { get; set; }
        public DateTime DateTaken { get; set; }
        public DateTime DateAdded { get; set; }
        public DateTime ScheduledDate { get; set; }
        public int Score { get; set; }
        public string PassStatus { get; set; }
        public bool HasBeenTaken { get; set; } = false;
        public int PassMarkPercentage { get; set; }
        public bool IsActivated { get; set; } = false;
        public ICollection<ExamReviewDTO> ExamReviews { get; set; }
        public ExamTakenDTO()
        {
            ExamReviews = new Collection<ExamReviewDTO>();
        }
    }
}
