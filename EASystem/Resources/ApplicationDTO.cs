using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Resources
{
    public class ApplicationDTO
    {
        public int Id { get; set; }
        public string Subject { get; set; }
        public DateTime ApplicationDate { get; set; }
        public string UserName { get; set; }
        public string ApplicationText { get; set; }
        public bool ReadStatus { get; set; }
        public DateTime ReadDate { get; set; }
        public bool IsOpened { get; set; }
    }
}
