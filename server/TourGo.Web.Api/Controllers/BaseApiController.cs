using Microsoft.AspNetCore.Mvc;
using TourGo.Web.Models.Responses;
using System.Net;
using TourGo.Web.Models;

namespace TourGo.Web.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected ILogger Logger { get; set; }
        public BaseApiController(ILogger logger)
        {
            logger.LogInformation($"Controller Firing {this.GetType().Name} ");
            Logger = logger;
        }

        protected OkObjectResult Ok200(BaseResponse respone)
        {

            return base.Ok(respone);
        }

        protected CreatedResult Created201(IItemResponse respone)
        {
            string url = Request.Path + "/" + respone.Item.ToString();

            return base.Created(url, respone);
        }

        protected NotFoundObjectResult NotFound404(BaseResponse respone)
        {
            return base.NotFound(respone);
        }

        protected ObjectResult CustomResponse(HttpStatusCode code, BaseResponse response)
        {
            return StatusCode((int)code, response);
        }
    }
}