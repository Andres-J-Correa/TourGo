using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Customers;
using TourGo.Services;
using TourGo.Services.Interfaces.Hotels;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Web.Api.Extensions;
using TourGo.Services.Interfaces;

namespace TourGo.Web.Api.Controllers.Hotels
{
    [Route("api/customers")]
    [ApiController]
    public class CustomersController : BaseApiController
    {
        private readonly IWebAuthenticationService<string> _webAuthService;
        private readonly ICustomerService _customerService;
        private readonly IErrorLoggingService _errorLoggingService;

        public CustomersController(
            ILogger<CustomersController> logger,
            IWebAuthenticationService<string> webAuthenticationService,
            ICustomerService customerService,
            IErrorLoggingService errorLoggingService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _customerService = customerService;
            _errorLoggingService = errorLoggingService;
        }

        [HttpPost("hotel/{hotelId}/dn")]
        //no need for entityAuth filter, handling auth inside the procedure
        public ActionResult<ItemResponse<Customer>> Get(CustomerGetRequest model, string hotelId)
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                Customer? customer = _customerService.GetByDocumentNumber(model.Id, userId, hotelId);

                if (customer == null)
                {
                    iCode = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Customer> { Item = customer };
                }
            }
            catch (Exception ex)
            {

                iCode = 500;
                Logger.LogErrorWithDb(ex, _errorLoggingService, HttpContext);
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }



        [HttpPost("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.Customers, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(CustomerAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();

                int id = _customerService.Add(model, userId, hotelId);

                if (id == 0)
                {
                    throw new Exception("Customer was not created");
                }

                ItemResponse<int> response = new ItemResponse<int>() { Item = id };

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


    }
}
