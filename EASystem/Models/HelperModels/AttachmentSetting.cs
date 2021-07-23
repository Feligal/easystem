using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Models.HelperModels
{
    public class AttachmentSetting
    {
        public int MaxBytes { get; set; }
        public string[] AcceptedFileTypes { get; set; }
        public bool IsSupported(string fileName)
        {
            return AcceptedFileTypes.Any(f => f == Path.GetExtension(fileName).ToLower());
        }
    }
}
