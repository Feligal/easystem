using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    public class BulkyEmailViewModel
    {
        public BulkyEmailViewModel()
        {
        }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Message { get; set; }
    }
}
