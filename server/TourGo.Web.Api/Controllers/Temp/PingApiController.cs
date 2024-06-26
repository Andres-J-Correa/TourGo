using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourGo.Web.Models.Responses;
using TourGo.Web.Controllers;

namespace TourGo.Web.Api.Controllers
{
    /// <summary>
    /// This controller is not required for the application to work. 
    /// You could remove it but it serves as a simple entry point for development
    /// </summary>
    [Route("api/ping")]
    [ApiController]
    public class PingApiController : BaseApiController
    {
        public PingApiController(ILogger<PingApiController> logger) : base(logger)
        {

        }

        [HttpGet()]
        [AllowAnonymous]
        public ActionResult<ItemResponse<object>> Ping()
        {
            Logger.LogInformation("Ping endpoint firing");

            ItemResponse<object> response = new ItemResponse<object>();

            response.Item = DateTime.Now.Ticks;

            return Ok200(response);
        }

        [HttpGet("auth")]
        public ActionResult<ItemResponse<object>> PingAuth()
        {
            Logger.LogInformation("Ping endpoint firing");

            ItemResponse<object> response = new ItemResponse<object>();

            response.Item = DateTime.Now.Ticks;

            return Ok200(response);
        }
    }
}