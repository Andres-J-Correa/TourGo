using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Tasks;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Tasks;
using TourGo.Services;
using TourGo.Services.Interfaces;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using Task = TourGo.Models.Domain.Tasks.Task;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotel/{hotelId}/tasks")]
    [ApiController]
    public class TasksController(ILogger<TasksController> logger,
                            IWebAuthenticationService<string> webAuthenticationService,
                            ITaskService taskService,
                            IErrorLoggingService errorLoggingService) : BaseApiController(logger)
    {
        private readonly IWebAuthenticationService<string> _webAuthService = webAuthenticationService;
        private readonly ITaskService _taskService = taskService;
        private readonly IErrorLoggingService _errorLoggingService = errorLoggingService;

        [HttpGet]
        [EntityAuth(EntityTypeEnum.Tasks, EntityActionTypeEnum.Read)]
        public ActionResult<ItemsResponse<Task>> GetTasksByDueDateRange(string hotelId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                List<Task>? tasks = _taskService.GetByDueDateRange(hotelId, startDate, endDate);

                if(tasks == null || tasks.Count == 0)
                {
                    return NotFound404(new ErrorResponse("No tasks found for the specified date range."));
                }

                ItemsResponse<Task> response = new()
                {
                    Items = tasks
                };

                return Ok200(response);
            }
            catch (Exception ex)
            {
                ErrorResponse response = new("An error occurred while retrieving tasks.");

                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, response);
            }
        }

        [HttpPost]
        [EntityAuth(EntityTypeEnum.Tasks, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Create(TaskAddRequest model, string hotelId)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int id = _taskService.Add(model, hotelId, userId);
                ItemResponse<int> response = new() { Item = id };
                return Created201(response);
            }
            catch (Exception ex)
            {
                ErrorResponse response = new("An error occurred while creating the task.");
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, response);
            }
        }

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.Tasks, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(TaskUpdateRequest model)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _taskService.Update(model, userId);
                return Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {
                ErrorResponse response = new("An error occurred while updating the task.");
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, response);
            }
        }

        [HttpPatch("{id:int}/reminders")]
        [EntityAuth(EntityTypeEnum.Tasks, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateReminders(int id, [FromQuery] bool remindersEnabled)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _taskService.UpdateTaskReminders(id, userId, remindersEnabled);
                return Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {
                ErrorResponse response = new("An error occurred while updating task reminders.");
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, response);
            }
        }

        [HttpPatch("{id:int}/completed")]
        [EntityAuth(EntityTypeEnum.Tasks, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> UpdateCompletedStatus(int id, [FromQuery] bool isCompleted)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _taskService.UpdateCompleted(id, userId, isCompleted);
                return Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {
                ErrorResponse response = new("An error occurred while updating task completed status.");
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, response);
            }
        }

        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.Tasks, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _taskService.Delete(id, userId);
                return Ok200(new SuccessResponse());
            }
            catch (Exception ex)
            {
                ErrorResponse response = new("An error occurred while deleting the task.");
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                return StatusCode(500, response);
            }
        }
    }

}
