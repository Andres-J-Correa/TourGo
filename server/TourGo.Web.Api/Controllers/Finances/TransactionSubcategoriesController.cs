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
        private readonly IWebAuthenticationService<int> _webAuthService;

        public TransactionSubcategoriesController(ILogger<TransactionSubcategoriesController> logger,
                                                ITransactionSubcategoryService transactionSubcategoryService,
                                                IErrorLoggingService errorLoggingService,
                                                IWebAuthenticationService<int> webAuthService) : base(logger)
        {
            _transactionSubcategoryService = transactionSubcategoryService;
            _errorLoggingService = errorLoggingService;
            _webAuthService = webAuthService;
        }


        [HttpPost("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Create)]
        public ActionResult<ItemResponse<int>> Add(TransactionSubcategoryAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
                int id = _transactionSubcategoryService.Add(model, userId);

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
        public ActionResult<SuccessResponse> Update(TransactionSubcategoryAddUpdateRequest model)
        {
            ObjectResult result = null;

            try
            {
                int userId = _webAuthService.GetCurrentUserId();
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
                int userId = _webAuthService.GetCurrentUserId();
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

        [HttpGet("hotel/{id:int}/minimal")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<TransactionSubcategoryBase>> GetMinimal(int id)
        {
            ObjectResult result = null;

            try
            {
                List<TransactionSubcategoryBase>? transactionSubcategories = _transactionSubcategoryService.GetMinimal(id);

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

        [HttpGet("hotel/{id:int}")]
        [EntityAuth(EntityTypeEnum.TransactionSubcategories, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<TransactionSubcategory>> Get(int id)
        {
            ObjectResult result = null;

            try
            {
                List<TransactionSubcategory>? transactionSubcategories = _transactionSubcategoryService.GetAll(id);

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
