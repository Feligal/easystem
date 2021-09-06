using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Extensions
{
    public class EmailSender:IEmailSender
    {
        private readonly IConfiguration configuration;
        public EmailSender(IConfiguration config)
        {
            configuration = config;
        }
        public async Task SendEmail(string fromEmail, string toEmail, string subject, string body)
        {
            //create message 
            var message = new MimeMessage();
            message.Sender = MailboxAddress.Parse(fromEmail);
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart(TextFormat.Html) { Text = body };
            
            //Send email
            using var smtp = new MailKit.Net.Smtp.SmtpClient();
            await smtp.ConnectAsync(configuration["EmailSettings:MailServer"], int.Parse(configuration["EmailSettings:Port"]), SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(configuration["EmailSettings:Sender"], configuration["EmailSettings:AdminPass"]);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);
        }
    }
}
