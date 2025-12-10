using TourGo.Data;
using TourGo.Data.Extensions;
using TourGo.Data.Providers;
using TourGo.Models.Requests.Tasks;
using TourGo.Services.Interfaces;
using Task = TourGo.Models.Domain.Tasks.Task;

namespace TourGo.Services.Tasks
{
    public class TaskService(IMySqlDataProvider mySqlDataProvider) : ITaskService
    {
        private readonly IMySqlDataProvider _mySqlDataProvider = mySqlDataProvider;

        public int AddTask(TaskAddRequest model, string hotelId, string userId)
        {
            int newId = 0;
            string proc = "tasks_create";

            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_title", model.Title);
                col.AddWithNullableValue("p_description", model.Description);
                col.AddWithValue("p_dueDate", model.DueDate);
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

        public void UpdateTask(TaskUpdateRequest model, string userId)
        {
            string proc = "tasks_update";
            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", model.Id);
                col.AddWithValue("p_title", model.Title);
                col.AddWithNullableValue("p_description", model.Description);
                col.AddWithValue("p_dueDate", model.DueDate);
                col.AddWithValue("p_assigneeId", model.AssignedUserId);
                col.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void UpdateTaskReminders(int taskId, string userId)
        {
            string proc = "tasks_update_reminders_enabled";
            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", taskId);
                col.AddWithValue("p_modifiedBy", userId);
            });
        }

        public void UpdateIsActive(int taskId, string userId)
        {
            string proc = "tasks_update_is_active";
            _mySqlDataProvider.ExecuteNonQuery(proc, (col) =>
            {
                col.AddWithValue("p_id", taskId);
                col.AddWithValue("p_modifiedBy", userId);
            });
        }

        public List<Task>? GetTasksByDueDateRange(string hotelId, DateTime startDate, DateTime endDate)
        {
            List<Task>? tasks = null;

            string proc = "tasks_select_by_due_date_range";

            _mySqlDataProvider.ExecuteCmd(proc, (col) =>
            {
                col.AddWithValue("p_hotelId", hotelId);
                col.AddWithValue("p_startDate", startDate);
                col.AddWithValue("p_endDate", endDate);
            }, (reader, set) =>
            {
                int index = 0;
                Task task = MapTask(reader, ref index);

                tasks ??= [];
                tasks.Add(task);
            });

            return tasks;
        }

        private static Task MapTask(System.Data.IDataReader reader, ref int index)
        {
            Task task = new Task()
            {
                Id = reader.GetInt32(index++),
                Title = reader.GetString(index++),
                Description = reader.GetSafeString(index++),
                DueDate = reader.GetDateTime(index++),
                RemindersEnabled = reader.GetBoolean(index++),
                CreatedBy = new Models.Domain.Users.UserBase()
                {
                    FirstName = reader.GetString(index++),
                    LastName = reader.GetString(index++),
                },
                ModifiedBy = new Models.Domain.Users.UserBase()
                {
                    FirstName = reader.GetString(index++),
                    LastName = reader.GetString(index++),
                },
                AssignedUser = new Models.Domain.Users.UserBase()
                {
                    FirstName = reader.GetString(index++),
                    LastName = reader.GetString(index++),
                },
                DateCreated = reader.GetDateTime(index++),
                DateModified = reader.GetDateTime(index++)
            };
            return task;
        }
    }
}
