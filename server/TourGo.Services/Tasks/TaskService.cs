using System.Data;
using TourGo.Data;
using TourGo.Data.Extensions;
using TourGo.Data.Providers;
using TourGo.Models.Domain.Tasks;
using TourGo.Models.Domain.Users;
using TourGo.Models.Requests.Tasks;
using TourGo.Services.Interfaces;
using Task = TourGo.Models.Domain.Tasks.Task;

namespace TourGo.Services.Tasks
{
    public class TaskService(IMySqlDataProvider mySqlDataProvider) : ITaskService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider = mySqlDataProvider;

        public int Add(TaskAddRequest model, string hotelId, string userId)
        {
            int newId = 0;
            string proc = "tasks_create";

            DateTime utcdate = model.DueDate.ToUniversalTime();

            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_title", model.Title);
                col.AddWithNullableValue("p_description", model.Description);
                col.AddWithValue("p_dueDate", utcdate);
                col.AddWithValue("p_assigneeId", model.AssignedUserId);
                col.AddWithValue("p_remindersEnabled", model.RemindersEnabled);
                col.AddWithValue("p_hotelId", hotelId);
                col.AddWithValue("p_createdBy", userId);
                col.AddOutputParameter("p_newId", MySql.Data.MySqlClient.MySqlDbType.Int32);

            }, (returnCol) =>
            {
                newId = Convert.ToInt32(returnCol["p_newId"].Value);
            });

            return newId;
        }

        public void Update(TaskUpdateRequest model, string userId)
        {
            string proc = "tasks_update";

            DateTime utcdate = model.DueDate.ToUniversalTime();

            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", model.Id);
                col.AddWithValue("p_title", model.Title);
                col.AddWithNullableValue("p_description", model.Description);
                col.AddWithValue("p_dueDate", utcdate);
                col.AddWithValue("p_assigneeId", model.AssignedUserId);
                col.AddWithValue("p_modifiedBy", userId);
                col.AddWithValue("p_remindersEnabled", model.RemindersEnabled);
            });
        }

        public void UpdateTaskReminders(int taskId, string userId, bool remindersEnabled)
        {
            string proc = "tasks_update_reminders_enabled_v2";
            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", taskId);
                col.AddWithValue("p_modifiedBy", userId);
                col.AddWithValue("p_remindersEnabled", remindersEnabled ? 1 : 0);
            });
        }

        public void Delete(int taskId, string userId)
        {
            string proc = "tasks_update_is_active_v2";
            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", taskId);
                col.AddWithValue("p_modifiedBy", userId);
                col.AddWithValue("p_isActive", 0);
            });
        }

        public List<Task>? GetByDueDateRange(string hotelId, DateTime startDate, DateTime endDate)
        {
            List<Task>? tasks = null;

            string proc = "tasks_select_by_due_date_range_v2";

            DateTime utcStartDate = startDate.ToUniversalTime();
            DateTime utcEndDate = endDate.ToUniversalTime();

            _mySqlDataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_hotelId", hotelId);
                col.AddWithValue("p_startDate", utcStartDate);
                col.AddWithValue("p_endDate", utcEndDate);
            }, (reader, set) =>
            {
                int index = 0;
                Task task = MapTask(reader, ref index);

                tasks ??= [];
                tasks.Add(task);
            });

            return tasks;
        }

        public void UpdateCompleted (int taskId, string userId, bool isComplete)
        {
            string proc = "tasks_update_completed";
            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", taskId);
                col.AddWithValue("p_modifiedBy", userId);
                col.AddWithValue("p_isComplete", isComplete ? 1 : 0);
            });
        }

        public List<TaskReminder>? GetOverdue()
        {
            string proc = "tasks_select_overdue";
            List<TaskReminder>? reminders = null;

            _mySqlDataProvider.ExecuteCmd(proc, null, (reader, set) =>
            {
                int index = 0;
                TaskReminder reminder = MapTaskReminder(reader, ref index);
                reminders ??= [];
                reminders.Add(reminder);
            });

            return reminders;
        }

        private static TaskReminder MapTaskReminder(IDataReader reader, ref int index)
        {
            return new TaskReminder()
            {
                Id = reader.GetSafeInt32(index++),
                Title = reader.GetSafeString(index++),
                Description = reader.GetSafeString(index++),
                DueDate = DateTime.SpecifyKind(reader.GetSafeDateTime(index++), DateTimeKind.Utc),
                AssigneeId = reader.GetSafeString(index++),
                HotelId = reader.GetSafeString(index++),
                HotelName = reader.GetSafeString(index++)
            };
        }

        private static Task MapTask(IDataReader reader, ref int index)
        {
            Task task = new Task()
            {
                Id = reader.GetSafeInt32(index++),
                Title = reader.GetSafeString(index++),
                Description = reader.GetSafeString(index++),
                DueDate = DateTime.SpecifyKind(reader.GetSafeDateTime(index++), DateTimeKind.Utc),
                RemindersEnabled = reader.GetSafeBool(index++),
                IsCompleted = reader.GetSafeBool(index++),
                CreatedBy = new UserBase()
                {
                    Id = reader.GetSafeString(index++),
                    FirstName = reader.GetSafeString(index++),
                    LastName = reader.GetSafeString(index++),
                },
                ModifiedBy = new UserBase()
                {
                    Id = reader.GetSafeString(index++),
                    FirstName = reader.GetSafeString(index++),
                    LastName = reader.GetSafeString(index++),
                },
                AssignedUser = new UserBase()
                {
                    Id = reader.GetSafeString(index++),
                    FirstName = reader.GetSafeString(index++),
                    LastName = reader.GetSafeString(index++),
                },
                DateCreated = reader.GetSafeDateTime(index++),
                DateModified = reader.GetSafeDateTime(index++)
            };

            return task;
        }
    }
}
