using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class ExamActiveViewModel
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public int Duration { get; set; }
        public DateTime TimeStarted { get; set; }
        public DateTime TimeFinished { get; set; }
        public int? DepartmentId { get; set; }

        public int NumberOfQuestions { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string UserId { get; set; }
        public int? ClientUserProfileId { get; set; }
        public DateTime DateTaken { get; set; }
        public DateTime DateAdded { get; set; }
        public DateTime ScheduledDate { get; set; }
        public int Score { get; set; }
        public string PassStatus { get; set; }
        public bool HasBeenTaken { get; set; } = false;
        public bool IsActivated { get; set; } = false;        
    }
}
