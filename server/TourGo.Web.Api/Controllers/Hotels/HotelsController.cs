using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums;
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
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("{id:int}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Hotel>> Get(int id)
        {
            int iCode = 200;
            BaseResponse response;

            try
            {
                Hotel ? hotel = _hotelService.GetById(id);

                if (hotel == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Hotel> { Item = hotel };
                }
            }
            catch (Exception ex)
            {

                iCode = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }


        [HttpGet]
        public ActionResult<ItemResponse<List<Hotel>>> GetUserHotels()
        {
            int iCode = 200;
            BaseResponse response;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                List<Hotel>? hotels = _hotelService.GetUserHotels(userId);

                if (hotels == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<List<Hotel>> { Item = hotels };
                }
            }
            catch (Exception ex)
            {
                iCode = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }
    }




}
