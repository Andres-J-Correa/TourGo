using Microsoft.AspNetCore.SignalR;
using TourGo.Services;

namespace TourGo.Web.Api.Hubs
{
    public class TaskRemindersHub (IWebAuthenticationService<string> authenticationService,
                                    ILogger<TaskRemindersHub> logger): Hub
    {

        private readonly IWebAuthenticationService<string> _authenticationService = authenticationService;
        private readonly ILogger<TaskRemindersHub> _logger = logger;
        public override async Task OnConnectedAsync()
        {
            string userId = _authenticationService.GetCurrentUserId();

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Unauthorized connection attempt to TaskRemindersHub with connection ID {ConnectionId}", Context.ConnectionId);
                Context.Abort();
                return;
            }
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string userId = _authenticationService.GetCurrentUserId();
            _logger.LogInformation("User {UserId} disconnected from TaskRemindersHub with connection ID {ConnectionId}", userId, Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}
