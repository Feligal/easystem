using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.ExamModels
{
    public class ClientUploadedImage
    {
        public int Id { get; set; }
        public string  FileName { get; set; }
        public string ThumbnailName { get; set; }
        public DateTime DateCreated { get; set; }
        public int ClientUserProfileId { get; set; }
    }
}
