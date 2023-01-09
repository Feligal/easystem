using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.HelperModels
{
    public class ExamStatisticModel
    {
        public ExamStatisticModel()
        {                
        }
        public string Name { get; set; }
        public int PassedExams { get; set; }
        public int FailedExams { get; set; }        

    }
}
