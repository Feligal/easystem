using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.HelperModels
{
    public class Notification
    {
        public int Id { get; set; }
        public bool IsOpened { get; set; } = false;
        public string Title { get; set; }
        public string Notice { get; set; }
        public string Source { get; set; }
        public DateTime DateOfNotification { get; set; }
    }
}
