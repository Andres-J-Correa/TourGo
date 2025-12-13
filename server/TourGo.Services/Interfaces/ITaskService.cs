using TourGo.Models.Domain.Tasks;
using TourGo.Models.Requests.Tasks;
using Task = TourGo.Models.Domain.Tasks.Task;

namespace TourGo.Services.Interfaces
{
    public interface ITaskService
    {
        int Add(TaskAddRequest model, string hotelId, string userId);
        List<Task>? GetByDueDateRange(string hotelId, DateTime startDate, DateTime endDate);
        void Delete(int taskId, string userId);
        void Update(TaskUpdateRequest model, string userId);
        void UpdateTaskReminders(int taskId, string userId, bool remindersEnabled);
        void UpdateCompleted(int taskId, string userId, bool isComplete);
        List<TaskReminder>? GetOverdue();
    }
}