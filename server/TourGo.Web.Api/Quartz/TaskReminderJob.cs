using Microsoft.Extensions.Logging;
using Quartz;
using Task = System.Threading.Tasks.Task;
using TourGo.Services.Interfaces;
using TourGo.Models.Domain.Tasks;
using Microsoft.AspNetCore.SignalR;
using TourGo.Web.Api.Hubs;

namespace TourGo.Services.Quartz
{
    public class TaskReminderJob (ILogger<TaskReminderJob> logger, ITaskService taskService, IHubContext<TaskRemindersHub> hubContext): IJob
    {
        private readonly ILogger<TaskReminderJob> _logger = logger;
        private readonly ITaskService _taskService = taskService;
        private readonly IHubContext<TaskRemindersHub> _hubContext = hubContext;

        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("TaskReminderJob is executing at {time}", DateTimeOffset.Now);
            
            List<TaskReminder>? overdueReminders = _taskService.GetOverdue();

            if(overdueReminders != null && overdueReminders.Count != 0)
            {
                var remindersByAssignee = overdueReminders
              .GroupBy(r => r.AssigneeId)
              .ToDictionary(g => g.Key, g => g.ToList());

                foreach (var assigneeReminders in remindersByAssignee)
                {
                    string userId = assigneeReminders.Key;

                    try
                    {
                        await _hubContext.Clients.User(userId)
                            .SendAsync("ReceiveTaskReminders", assigneeReminders.Value);
                    }
                    catch (Exception ex)
                    {

                        _logger.LogError(ex, "Failed to send reminders to User {UserId}", userId);
                    }
                }
            }
        }
    }
}
