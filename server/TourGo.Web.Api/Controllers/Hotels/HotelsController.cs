using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Requests.Hotels;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotels")]
    [ApiController]
    public class HotelsController : BaseApiController
    {
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly IHotelService _hotelService;

        public HotelsController(ILogger<HotelsController> logger, IWebAuthenticationService<int> webAuthenticationService, IHotelService hotelService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _hotelService = hotelService;
        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(HotelAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                int id = _hotelService.Create(model, userId);

                if (id == 0)
                {
                    throw new Exception("Failed to create hotel");
                }

                ItemResponse<int> response = new ItemResponse<int>() { Item = id };
                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }

            return result;
        }
    }

    


}
