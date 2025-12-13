using Microsoft.Extensions.Logging;
using Quartz;
using TourGo.Models.Attributes;

namespace TourGo.Services.Quartz
{
    public class TaskReminderJob (ILogger<TaskReminderJob> logger): IJob
    {
        private readonly ILogger<TaskReminderJob> _logger = logger;
        public Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("SampleJob is executing at {time}", DateTimeOffset.Now);
            // Add your job logic here
            return Task.CompletedTask;
        }
    }
}
