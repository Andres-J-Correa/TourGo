using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Domain.Finances;
using TourGo.Models.Enums;
using TourGo.Models.Requests.Finances;
using TourGo.Web.Api.Extensions;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;
using TourGo.Services.Interfaces;
using TourGo.Services;
using TourGo.Services.Interfaces.Finances;

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/transaction-subcategories")]
    [ApiController]
    public class TransactionSubcategoriesController : BaseApiController
    {
        private readonly ITransactionSubcategoryService _transactionSubcategoryService;
        private readonly IErrorLoggingService _errorLoggingService;
        private readonly IWebAuthenticationService<string> _webAuthService;

        public TransactionSubcategoriesController(ILogger<TransactionSubcategoriesController> logger,
                                                ITransactionSubcategoryService transactionSubcategoryService,
                                                IErrorLoggingService errorLoggingService,
                                                IWebAuthenticationService<string> webAuthService) : base(logger)
        {
            _transactionSubcategoryService = transactionSubcategoryService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
        }


        [HttpPost("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(TransactionSubcategoryAddRequest model, string hotelId)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                int id = _transactionSubcategoryService.Add(model, userId, hotelId);

                if (id == 0)
                {
                    throw new Exception("Failed to create transaction subcategory");
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

        [HttpPut("{id:int}")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Update)]
        public ActionResult<SuccessResponse> Update(TransactionSubcategoryUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _transactionSubcategoryService.Update(model, userId);

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

        [HttpDelete("{id:int}")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Delete)]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            ObjectResult result = null;

            try
            {
                string userId = _webAuthService.GetCurrentUserId();
                _transactionSubcategoryService.Delete(id, userId);

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

        [HttpGet("hotel/{hotelId}/minimal")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<TransactionSubcategoryBase>> GetMinimal(string hotelId)
        {
            ObjectResult result = null;

            try
            {
                List<TransactionSubcategoryBase>? transactionSubcategories = _transactionSubcategoryService.GetMinimal(hotelId);

                if (transactionSubcategories == null)
                {
                    ErrorResponse response = new ErrorResponse("No transaction subcategories found for the given hotel ID.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<TransactionSubcategoryBase> response = new ItemsResponse<TransactionSubcategoryBase> { Items = transactionSubcategories };
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

        [HttpGet("hotel/{hotelId}")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<TransactionSubcategory>> Get(string hotelId)
        {
            ObjectResult result = null;

            try
            {
                List<TransactionSubcategory>? transactionSubcategories = _transactionSubcategoryService.GetAll(hotelId);

                if (transactionSubcategories == null)
                {
                    ErrorResponse response = new ErrorResponse("No transaction subcategories found for the given hotel ID.");
                    result = NotFound404(response);
                }
                else
                {
                    ItemsResponse<TransactionSubcategory> response = new ItemsResponse<TransactionSubcategory> { Items = transactionSubcategories };
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
