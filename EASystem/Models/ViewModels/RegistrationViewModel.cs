using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class RegistrationViewModel
    {
        public RegistrationViewModel()
        {

        }
        public int Id { get; set; }
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }
        [Required]
        [StringLength(50)]
        public string LastName { get; set; }
        [StringLength(50)]
        public string OtherName { get; set; }
        [Required]
        [StringLength(50)]
        public string UserName { get; set; }
        [Required]
        [StringLength(10)]
        public string Gender { get; set; }
        [Required]
        
        public DateTime Dob { get; set; }
        [Required]
       
        public int Noc { get; set; }
        [Required]
        [StringLength(11)]
        public string Nrc { get; set; }
        [Required]
        [StringLength(15)]
        public string MaritalStatus { get; set; }
        [Required]
        [StringLength(14)]
        public string  Phone { get; set; }

        [Required]        
        [StringLength(50)]
        [RegularExpression("^[a-zA-Z0-9_\\.-]+@([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$", ErrorMessage = "E-mail is not valid")]
        public string Email { get; set; }
        [Required]
        [StringLength(50)]
        public string Password { get; set; }
        [Required]
        [StringLength(100)]
        public string Address { get; set; }
        [Required]
        [StringLength(50)]
        public string City { get; set; }
        [Required]
        //Properties for the Next of Kin
        [StringLength(50)]
        public string FirstNameNext { get; set; }
        [Required]
        [StringLength(50)]
        public string LastNameNext { get; set; }
        [StringLength(50)]
        public string OtherNameNext { get; set; }
        [Required]
        [StringLength(10)]
        public string GenderNext { get; set; }
        [Required]
        [StringLength(11)]
        public string NrcNext { get; set; }
        [Required]
        [StringLength(50)]
        public string Relationship { get; set; }
        [Required]
        [StringLength(13)]
        public string  PhoneNext { get; set; }
        [Required]
        [StringLength(50)]
        public string  CityNext { get; set; }
        //Properties for the Employer
        [Required]
        [StringLength(50)]
        public string CurrentEmployer { get; set; }
        [Required]
        [StringLength(50)]
        public string Position { get; set; }
        [Required]
        [StringLength(13)]
        public string EmployerPhone { get; set; }
        [Required]
        [StringLength(100)]
        public string EmployerAddress { get; set; }
        [Required]
        [StringLength(50)]
        public string EmployerCity { get; set; }

    }
}
