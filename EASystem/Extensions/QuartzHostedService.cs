using Microsoft.Extensions.Hosting;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EASystem.Extensions
{
    public class QuartzHostedService: IHostedService
    {
        private readonly IScheduler _scheduler;
        public QuartzHostedService(IScheduler scheduler)
        {
            _scheduler = scheduler;
        }
        public Task StartAsync(CancellationToken ct)
        {
            return _scheduler.Start(ct);
        }

        public Task StopAsync(CancellationToken ct)
        {
            return _scheduler.Shutdown(ct);
        }

        //public Task ProcessAerodromeSchedules()
        //{
        //    var jobDetails = JobBuilder.CreateForAsync<AerodromeScheduleMonitor>()
        //        .WithIdentity($"ScheduledTaskProcessJob - {DateTime.Now}")
        //        .Build();
        //    var trigger = TriggerBuilder.
        //        Create()
        //        .WithIdentity($"ScheduledTaskProcessJobTrigger - {DateTime.Now}")
        //        .WithDescription("Trigger for Processing Background Aerdodrome Schedules")
        //        .WithSimpleSchedule(x => x.WithIntervalInMinutes(8).RepeatForever())
        //        .Build();
        //    return _scheduler.ScheduleJob(jobDetails, trigger);
        //}


        //public Task ProcessAerodromeLicenceValidity()
        //{
        //    var jobDetails = JobBuilder.CreateForAsync<AerodromeLicenceMonitor>()
        //        .WithIdentity($"LicenceValidityTaskProcessJob - {DateTime.Now}")
        //        .Build();
        //    var trigger = TriggerBuilder.
        //        Create()
        //        .WithIdentity($"LicenceTaskProcessJobTrigger - {DateTime.Now}")
        //        .WithDescription("Trigger for Processing Background Aerdodrome Licence Validity")
        //        //.WithSimpleSchedule(x => x.WithIntervalInHours(4).RepeatForever()) //Runs every 4hours    
        //        //.WithSchedule(CronScheduleBuilder.DailyAtHourAndMinute(8, 30)) //Runs every  at 08:30hours               
        //        .WithSimpleSchedule(x => x.WithIntervalInMinutes(10).RepeatForever()) //Runs every 4hours   
        //        .Build();
        //    return _scheduler.ScheduleJob(jobDetails, trigger);
        //}

    }
}
