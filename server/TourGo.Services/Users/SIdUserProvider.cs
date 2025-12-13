using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace TourGo.Services.Users
{
    public class SIdUserProvider: IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            // Tell SignalR to use the 'Sid' claim as the User ID
            return connection.User?.FindFirst(ClaimTypes.Sid)?.Value;
        }
    }
}
