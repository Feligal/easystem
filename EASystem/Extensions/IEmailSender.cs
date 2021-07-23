using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Extensions
{
    public interface IEmailSender
    {
        Task SendEmail(string fromEmail, string toEmail, string subject, string body);
    }
}
