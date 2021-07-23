using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class LogDTO
    {
        public int Id { get; set; }
        public string LogInformation { get; set; }
        public string Owner { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
