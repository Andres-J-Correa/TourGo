using TourGo.Models.Requests.Tasks;

namespace TourGo.Services.Interfaces
{
    public interface ITaskService
    {
        int AddTask(TaskAddRequest model, string hotelId, string userId);
        List<Models.Domain.Tasks.Task>? GetTasksByDueDateRange(string hotelId, DateTime startDate, DateTime endDate);
        void UpdateIsActive(int taskId, string userId);
        void UpdateTask(TaskUpdateRequest model, string userId);
        void UpdateTaskReminders(int taskId, string userId);
    }
}