using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Hotels;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
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

        [HttpGet("current")]
        public ActionResult<HotelBase> GetHotel()
        {
            int code = 200;
            BaseResponse response;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                HotelBase? hotel = _hotelService.GetHotel(userId);

                if (hotel != null)
                {
                    response = new ItemResponse<HotelBase> { Item = hotel };
                }
                else
                {
                    response = new ErrorResponse("No hotel found");
                    code = 404;
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex.Message);
                code = 500;
                response = new ErrorResponse(ex.Message);
            }

            return StatusCode(code, response);
        }
    }
}
