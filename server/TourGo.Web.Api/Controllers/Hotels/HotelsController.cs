using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MySql.Data.MySqlClient;
using MySqlX.XDevAPI.Common;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Config;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Domain.Invoices;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Finances;
using TourGo.Models.Requests.Hotels;
using TourGo.Services;
using TourGo.Services.Finances;
using TourGo.Services.Hotels;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Services.Security;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Enums;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/hotels")]
    [ApiController]
    public class HotelsController : BaseApiController
    {
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly IHotelService _hotelService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly HotelsPublicIdConfig _hotelsPublicIdConfig;

        public HotelsController(ILogger<HotelsController> logger, 
            IWebAuthenticationService<string> webAuthenticationService, 
            IHotelService hotelService,
            IErrorLoggingService errorLoggingService,
            IOptions<HotelsPublicIdConfig> publicIdOptions) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _hotelService = hotelService;
            _errorLoggingService = errorLoggingService;
            _hotelsPublicIdConfig = publicIdOptions.Value;
        }

        
        [HttpPost]
        [VerifiedUser]
        public ActionResult<ItemResponse<string>> Create(HotelAddRequest model)
        {
            ObjectResult result = null;

            try
            {
                string? publicId = null;
                int attemptsMade = 0;

                do
                {
                    List<string> possiblePublicIds = PublicIdGeneratorService.GenerateSecureIds(_hotelsPublicIdConfig.NumberOfIdsToGenerate,
                                                                                                _hotelsPublicIdConfig.Length,
                                                                                                _hotelsPublicIdConfig.Characters);

                    List<string>? availablePublicIds = _hotelService.GetAvailablePublicIds(possiblePublicIds);

                    if (availablePublicIds != null && availablePublicIds.Count > 0)
                    {
                        publicId = availablePublicIds[0];
                    }

                    attemptsMade++;
                } while (publicId == null && attemptsMade < _hotelsPublicIdConfig.MaxAttempts);

                if (publicId == null)
                {
                    throw new Exception("Failed to generate a unique public ID after maximum attempts.");
                }

                string userId = _webAuthService.GetCurrentUserId();

                int id = _hotelService.Create(model, userId, publicId);

                if (id == 0)
                {
                    throw new Exception("Failed to create hotel");
                }

                ItemResponse<string> response = new ItemResponse<string>() { Item = publicId };
                result = Created201(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();

                result = StatusCode(500, response);
            }

            return result;
        }

        [HttpGet("{hotelId}/details")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Hotel>> GetDetails(string hotelId)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                Hotel ? hotel = _hotelService.GetDetails(hotelId);

                if (hotel == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Hotel> { Item = hotel };
                }
            }
            catch (Exception ex)
            {

                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }


        [HttpGet]
        public ActionResult<ItemsResponse<HotelMinimal>> GetUserHotels()
        {
            BaseResponse response;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                List<HotelMinimal>? hotels = _hotelService.GetUserHotelsMinimal(userId);

                if (hotels == null)
                {
                
                    response = new ErrorResponse("Application Resource not found.");
                    return NotFound404(response);
                }
                else
                {
                    response = new ItemsResponse<HotelMinimal> { Items = hotels };
                    return Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
                return StatusCode(500, response);
            }
        }

        [HttpGet("{hotelId}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<HotelMinimal>> GetMinimal(string hotelId)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                HotelMinimal? lookup = _hotelService.GetMinimal(hotelId);

                if (lookup == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<HotelMinimal> { Item = lookup };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpGet("minimal/{hotelId}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<HotelMinimalWithUserRole>> GetMinimalWithUserRole(string hotelId)
        {
            int code = 200;
            BaseResponse response;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                HotelMinimalWithUserRole? hotel = _hotelService.GetMinimalWithUserRole(hotelId, userId);

                if (hotel == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<HotelMinimalWithUserRole> { Item = hotel };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpPut("{id}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(HotelUpdateRequest model)
 {
            int code = 200;
            BaseResponse response = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _hotelService.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
            }

            return StatusCode(code, response);
        }


        [HttpDelete("{hotelId}")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(string hotelId)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _hotelService.Delete(hotelId, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse();
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
            }

            return StatusCode(code, response);
        }

        [HttpGet("roles/permissions")]
        public ActionResult<ItemsResponse<RolePermission>> GetRolePermissions()
        {
            int code = 200;
            BaseResponse response;

            try
            {
                List<RolePermission>? permissions = _hotelService.GetRolePermissions();

                if (permissions == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemsResponse<RolePermission> { Items = permissions };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(code, response);
        }

        [HttpPost("{hotelId}/invoices-tc")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> InvoicesUpsertDefaultTC(InvoiceDefaultTCAddUpdateRequest model, string hotelId)
        {
            ObjectResult? result = null;
            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _hotelService.InvoicesUpsertDefaultTC(hotelId, model, userId);
                SuccessResponse response = new SuccessResponse();
                result = Ok200(response);
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }

        [HttpGet("{hotelId}/invoices-tc")]
        [EntityAuth(EntityTypeEnum.Hotels, EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<InvoicesDefaultTC>> GetInvoicesDefaultTC(string hotelId)
        {
            ObjectResult? result = null;
            try
            {
                InvoicesDefaultTC? defaultTC = _hotelService.GetInvoicesDefaultTC(hotelId);
                if (defaultTC == null)
                {
                    ErrorResponse response = new ErrorResponse("Default terms and conditions not found.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemResponse<InvoicesDefaultTC> response = new ItemResponse<InvoicesDefaultTC> { Item = defaultTC };
                    result = Ok200(response);
                }
            }
            catch (Exception ex)
            {
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                ErrorResponse response = new ErrorResponse();
                result = StatusCode(500, response);
            }
            return result;
        }
    }
}
