using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    public class CompanyInfo
    {
        public CompanyInfo()
        {

        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Aliase { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string Contact { get; set; }
        public string Fax { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
    }
}
