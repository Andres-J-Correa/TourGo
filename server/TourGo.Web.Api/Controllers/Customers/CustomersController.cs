using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Customers;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Customers;
using TourGo.Services;
using TourGo.Services.Interfaces.Customers;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Customers
{
    [Route("api/customers")]
    [ApiController]
    public class CustomersController : BaseApiController
    {
        private readonly IWebAuthenticationService<int> _webAuthService;
        private readonly ICustomerService _customerService;

        public CustomersController(
            ILogger<CustomersController> logger, 
            IWebAuthenticationService<int> webAuthenticationService, 
            ICustomerService customerService) : base(logger)
        {
            _webAuthService = webAuthenticationService;
            _customerService = customerService;
        }

        [HttpGet("document-number")]
        //[EntityAuth(EntityTypeEnum.Customers,EntityActionTypeEnum.Read)]
        public ActionResult<ItemResponse<Customer>> Get(CustomerGetRequest model) 
        {
            int iCode = 200;
            BaseResponse response = null;

            try
            {
                Customer? customer = _customerService.GetByDocumentNumber(model.Id);

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
                Logger.LogError(ex.ToString());
                response = new ErrorResponse();
            }

            return StatusCode(iCode, response);
        }



        [HttpPost("hotel/{id:int}")]
        //[EntityAuth(EntityTypeEnum.Customers, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(CustomerAddEditRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();

                int id = _customerService.Add(model, userId);

                if(id == 0)
                {
                    throw new Exception("Customer was not created");
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


    }
}
