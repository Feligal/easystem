
using EASystem.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Impl;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Extensions
{
    public static class ScheduleManager
    {
        public static IScheduler GetScheduler(IServiceCollection services, IConfiguration configuration)
        {
            var properties = new NameValueCollection {
                { "quartz.scheduler.instanceName" , configuration["Data:QuartzProperties:InstanceName"]},
                { "quartz.scheduler.instanceId", configuration["Data:QuartzProperties:InstanceId"]},
                { "quartz.jobStore.type" , configuration["Data:QuartzProperties:Type"]},
                { "quartz.jobStore.useProperties", configuration["Data:QuartzProperties:UseProperties"]},
                { "quartz.jobStore.dataSource" , configuration["Data:QuartzProperties:DataSource"]},
                { "quartz.jobStore.tablePrefix", configuration["Data:QuartzProperties:TablePrefix"]},
                {
                "quartz.dataSource.default.connectionString", configuration["Data:QuartzProperties:ConnectionString"]
                },
                { "quartz.dataSource.default.provider", configuration["Data:QuartzProperties:Provider"]},
                { "quartz.threadPool.threadCount", configuration["Data:QuartzProperties:ThreadCount"]},
                { "quartz.serializer.type", configuration["Data:QuartzProperties:SerializerType"]}
            };
            var schedulerFactory = StdSchedulerFactory.GetDefaultScheduler().GetAwaiter().GetResult();
            schedulerFactory.JobFactory = new QuartzJobFactory(services.BuildServiceProvider());
            return schedulerFactory;
        }

        //private static async Task ChangeScheduleStatus(IEmailSender emailSender, IConfiguration configuration, IUnitOfWork unitOfWork, IAppRepository appRepository, InspectionSchedule scheduleItem)
        //{
        //    scheduleItem.Status = "Overdue";
        //    var aerodrome = await appRepository.GetAerodromeById(scheduleItem.AerodromeId);
        //    var notification = new AerodromeNotification
        //    {
        //        IsOpened = false,
        //        Notice = $"This serves to notify you that the inspection schedule for {aerodrome.Name} Aerodrome is overdue.",
        //        NotificationDate = DateTime.Now,
        //        Source = "System",
        //        Title = "Inspection Schedule Overdue"
        //    };

        //    appRepository.AddAerodromeNotification(notification);
        //    unitOfWork.GetAppDbContext().Entry(notification).State = EntityState.Added;
        //    unitOfWork.GetAppDbContext().Entry(scheduleItem).State = EntityState.Modified;
        //    await unitOfWork.CompletionAsync();
        //    //Send email here;
        //    string fromEmail = configuration["EmailSettings:Sender"];
        //    string toEmail = configuration["AerodromeInspectorEmails:Emails"];
        //    string subject = $"Inspection Schedule Notification for {aerodrome.Name} aerodrome";
        //    string body = $"Dear All, <br/> This serves to inform you that the inspection schedule for the {aerodrome.Name} is due today.<br/> Kind regards, <br/> CAA Admin";
        //    await emailSender.SendEmail(fromEmail, toEmail, subject, body);
        //}
        //private static async Task ProcessScheduleNotifications(IEmailSender emailSender, IConfiguration configuration, IUnitOfWork unitOfWork, IAppRepository appRepository, int elapsedDays, InspectionSchedule scheduleItem)
        //{

        //    var aerodrome = await appRepository.GetAerodromeById(scheduleItem.AerodromeId);
        //    var notification = new AerodromeNotification
        //    {
        //        IsOpened = false,
        //        Notice = $"This serves to notify you that the inspection schedule for {aerodrome.Name} Aerodrome will be due in {Math.Abs(elapsedDays)} days time.",
        //        NotificationDate = DateTime.Now,
        //        Source = "System",
        //        Title = "Inspection Schdule Overdue"
        //    };
        //    appRepository.AddAerodromeNotification(notification);
        //    unitOfWork.GetAppDbContext().Entry(notification).State = EntityState.Added;
        //    await unitOfWork.GetAppDbContext().SaveChangesAsync();
        //    //Send email here;
        //    string fromEmail = configuration["EmailSettings:Sender"];
        //    string toEmail = configuration["AerodromeInspectorEmails:Emails"]; //To be changed to the clients email            
        //    string subject = $"Inspection Schedule Notification for { aerodrome.Name } aerodrome";
        //    string body = $"Dear All, <br/> This serves to inform you that the inspection schedule for { aerodrome.Name } aerodrome will be due in {Math.Abs((elapsedDays))} days time.<br/> Kind regards, <br/>CAA Admin";
        //    await emailSender.SendEmail(fromEmail, toEmail, subject, body);

        //}

        //public static async Task MonitorAerodromeSchedules(IAppRepository appRepository, IUnitOfWork unitOfWork, IEmailSender emailSender, IConfiguration configuration)
        //{
        //    var schedules = await appRepository.GetAllPendingInspectionSchedules();
        //    foreach (var schedule in schedules)
        //    {
        //        int elapsedDays = schedule.EndDate.Subtract(DateTime.Now).Days;
        //        if (elapsedDays <= 0 && schedule.Status == "Pending")
        //        {
        //            await ChangeScheduleStatus(emailSender, configuration, unitOfWork, appRepository, schedule);
        //        }
        //        if (Math.Abs(elapsedDays) == int.Parse(configuration["ScheduleValues:FirstValue"]))
        //        {
        //            await ProcessScheduleNotifications(emailSender, configuration, unitOfWork, appRepository, elapsedDays, schedule);
        //        }
        //        if (Math.Abs(elapsedDays) == int.Parse(configuration["ScheduleValues:SecondValue"]))
        //        {
        //            await ProcessScheduleNotifications(emailSender, configuration, unitOfWork, appRepository, elapsedDays, schedule);
        //        }
        //    }
        //}


        //public static async Task MonitorAerodromeLicencess(IAppRepository appRepository, IUnitOfWork unitOfWork, IEmailSender emailSender, IConfiguration configuration)
        //{
        //    var licences = await appRepository.GetAllValidAerodromeLicences();
        //    foreach (var license in licences)
        //    {
        //        int elapsedDays = license.DateOfExpiry.Subtract(DateTime.Now).Days;
        //        if (elapsedDays <= 0 && license.Status == "Valid")
        //        {
        //            await ChangeLicenseStatus(emailSender, configuration, unitOfWork, appRepository, license);
        //        }
        //        if (Math.Abs(elapsedDays) == int.Parse(configuration["ScheduleValues:FirstValue"]))
        //        {
        //            await ProcessLicenseNotifications(emailSender, configuration, unitOfWork, appRepository, elapsedDays, license);
        //        }
        //        if (Math.Abs(elapsedDays) == int.Parse(configuration["ScheduleValues:SecondValue"]))
        //        {
        //            await ProcessLicenseNotifications(emailSender, configuration, unitOfWork, appRepository, elapsedDays, license);
        //        }
        //    }
        //}


        //private static async Task ChangeLicenseStatus(IEmailSender emailSender, IConfiguration configuration, IUnitOfWork unitOfWork, IAppRepository appRepository, AerodromeLicence licenceItem)
        //{
        //    licenceItem.Status = "Expired";
        //    var aerodrome = await appRepository.GetAerodromeById(licenceItem.AerodromeId);
        //    var notification = new AerodromeNotification
        //    {
        //        IsOpened = false,
        //        Notice = $"This serves to notify you that the Licence for {aerodrome.Name} Aerodrome has expired.",
        //        NotificationDate = DateTime.Now,
        //        Source = "System",
        //        Title = $"Licence Expiration Notice for {aerodrome.Name} aerodrome"
        //    };

        //    appRepository.AddAerodromeNotification(notification);
        //    unitOfWork.GetAppDbContext().Entry(notification).State = EntityState.Added;
        //    unitOfWork.GetAppDbContext().Entry(licenceItem).State = EntityState.Modified;
        //    await unitOfWork.CompletionAsync();
        //    //Send email here;
        //    string fromEmail = configuration["EmailSettings:Sender"];
        //    string toEmail = configuration["AerodromeInspectorEmails:Emails"]; //To be changed to the clients email
        //    string subject = $"Licence Expiration Notice for {aerodrome.Name} aerodrome";
        //    string body = $"Dear All, <br/> This serves to inform you that the License for the {aerodrome.Name} has expired.<br/> Kind regards, <br/> CAA Admin";
        //    await emailSender.SendEmail(fromEmail, toEmail, subject, body);


        //    string operatorEmails = "";

        //    var operatorUsers = await appRepository.GetOperatorUserProfilesByAeroId(aerodrome.AerodromeOperatorId);
        //    if (operatorUsers != null)
        //    {
        //        foreach (var operatorUser in operatorUsers)
        //        {
        //            operatorEmails = operatorUser.Email;
        //            string operatorFromEmail = configuration["EmailSettings:Sender"];
        //            string operatorToEmail = operatorEmails;
        //            string operatorSubject = $"Licence Expiration Notice for {aerodrome.Name} aerodrome";
        //            string operatorBody = $"Dear All, <br/> This serves to inform you that the License for the {aerodrome.Name} has expired.<br/> Kind regards, <br/> CAA Admin";
        //            await emailSender.SendEmail(operatorFromEmail, operatorToEmail, operatorSubject, operatorBody);
        //        }
        //    }
        //}

        //private static async Task ProcessLicenseNotifications(IEmailSender emailSender, IConfiguration configuration, IUnitOfWork unitOfWork, IAppRepository appRepository, int elapsedDays, AerodromeLicence licence)
        //{
        //    var aerodrome = await appRepository.GetAerodromeById(licence.AerodromeId);
        //    var notification = new AerodromeNotification
        //    {
        //        IsOpened = false,
        //        Notice = $"This serves to notify you that the License for {aerodrome.Name} Aerodrome will expire in {Math.Abs(elapsedDays)} days time.",
        //        NotificationDate = DateTime.Now,
        //        Source = "System",
        //        Title = $"Licence Expiration Notice for {aerodrome.Name} aerodrome"
        //    };
        //    appRepository.AddAerodromeNotification(notification);
        //    unitOfWork.GetAppDbContext().Entry(notification).State = EntityState.Added;
        //    await unitOfWork.GetAppDbContext().SaveChangesAsync();
        //    //Send email here;
        //    string fromEmail = configuration["EmailSettings:Sender"];
        //    string toEmail = configuration["AerodromeInspectorEmails:Emails"]; //To be changed to the clients email
        //    string subject = $"Licence Expiration Notice for {aerodrome.Name} aerodrome";
        //    string body = $"Dear All, <br/> This serves to inform you that the license for { aerodrome.Name } aerodrome will expire in {Math.Abs((elapsedDays))} days time.<br/> Kind regards, <br/>CAA Admin";
        //    await emailSender.SendEmail(fromEmail, toEmail, subject, body);

        //    string operatorEmails = "";
        //    var operatorUsers = await appRepository.GetOperatorUserProfilesByAeroId(aerodrome.AerodromeOperatorId);
        //    if (operatorUsers != null)
        //    {
        //        foreach (var operatorUser in operatorUsers)
        //        {
        //            operatorEmails = operatorUser.Email;
        //            string operatorFromEmail = configuration["EmailSettings:Sender"];
        //            string operatorToEmail = operatorEmails;
        //            string operatorSubject = $"Licence Expiration Notice for {aerodrome.Name} aerodrome";
        //            string operatorBody = $"Dear All, <br/> This serves to inform you that the license for { aerodrome.Name } aerodrome will expire in {Math.Abs((elapsedDays))} days time.<br/> Kind regards, <br/>CAA Admin";
        //            await emailSender.SendEmail(operatorFromEmail, operatorToEmail, operatorSubject, operatorBody);
        //        }
        //    }
        //}
    }
}
