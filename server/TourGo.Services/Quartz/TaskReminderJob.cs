using Microsoft.Extensions.Logging;
using Quartz;
using Task = System.Threading.Tasks.Task;
using TourGo.Services.Interfaces;
using TourGo.Models.Domain.Tasks;

namespace TourGo.Services.Quartz
{
    public class TaskReminderJob (ILogger<TaskReminderJob> logger, ITaskService taskService): IJob
    {
        private readonly ILogger<TaskReminderJob> _logger = logger;
        private readonly ITaskService _taskService = taskService;

        public Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("TaskReminderJob is executing at {time}", DateTimeOffset.Now);
            
            List<TaskReminder>? overdueReminders = _taskService.GetOverdue();

            return Task.CompletedTask;
        }
    }
}
