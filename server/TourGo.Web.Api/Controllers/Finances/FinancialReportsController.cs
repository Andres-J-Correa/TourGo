using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourGo.Models.Enums;
using TourGo.Models.Enums.Transactions;
using TourGo.Models.Responses.Finance;
using TourGo.Services.Interfaces.Finances;
using TourGo.Web.Controllers;
using TourGo.Web.Core.Filters;
using TourGo.Web.Models.Responses;

namespace TourGo.Web.Api.Controllers.Finances
{
    [Route("api/financial-reports/hotel/{hotelId}")]
    [ApiController]
    public class FinancialReportsController : BaseApiController
    {
        private readonly IFinancialReportService _financialReportService;

        public FinancialReportsController(
            ILogger<FinancialReportsController> logger,
            IFinancialReportService financialReportService)
            : base(logger)
        {
            _financialReportService = financialReportService;
        }

        [HttpGet("category-performance")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<CategoryPerformanceOverTimeResponse>> GetCategoryPerformanceOverTime(
            string hotelId,
            [FromQuery] TransactionCategoryEnum categoryId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetCategoryPerformanceOverTime(hotelId, (int)categoryId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<CategoryPerformanceOverTimeResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("cost-to-revenue-ratio")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<CostToRevenueRatioResponse>> GetCostToRevenueRatio(
            string hotelId,
            [FromQuery] TransactionCategoryEnum revenueCategoryId,
            [FromQuery] TransactionCategoryEnum expenseCategoryId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetCostToRevenueRatio(hotelId, (int)revenueCategoryId, (int)expenseCategoryId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<CostToRevenueRatioResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("expense-breakdown")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<ExpenseBreakdownResponse>> GetExpenseBreakdown(
            string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetExpenseBreakdown(hotelId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<ExpenseBreakdownResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("payment-methods-totals")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<PaymentMethodTotalsResponse>> GetPaymentMethodsTotalsByHotelId(string hotelId, 
            [FromQuery] string currencyCode,
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate
            )
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetPaymentMethodsTotalsByHotelId(hotelId, currencyCode, startDate, endDate);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<PaymentMethodTotalsResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("profit-and-loss-summary")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<ProfitAndLossSummaryResponse>> GetProfitAndLossSummary(
            string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetProfitAndLossSummary(hotelId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemResponse<ProfitAndLossSummaryResponse> { Item = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("revenue-breakdown")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<RevenueBreakdownResponse>> GetRevenueBreakdown(
            string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetRevenueBreakdown(hotelId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<RevenueBreakdownResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("subcategory-analysis")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<SubcategoryAnalysisResponse>> GetSubcategoryAnalysis(
            string hotelId,
            [FromQuery] TransactionCategoryEnum categoryId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetSubcategoryAnalysis(hotelId, (int)categoryId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<SubcategoryAnalysisResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("utility-cost-analysis")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<UtilityCostAnalysisResponse>> GetUtilityCostAnalysis(
            string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate,
            [FromQuery] string currencyCode)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetUtilityCostAnalysis(hotelId, startDate, endDate, currencyCode);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<UtilityCostAnalysisResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("revpar-over-time")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<RevPAROverTimeResponse>> GetRevPAROverTime(
        string hotelId,
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetRevPAROverTime(hotelId, startDate, endDate);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<RevPAROverTimeResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("occupancy-over-time")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemsResponse<HotelOccupancyOverTimeResponse>> GetHotelOccupancyOverTime(
            string hotelId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            ObjectResult result;
            try
            {
                var data = _financialReportService.GetHotelOccupancyOverTime(hotelId, startDate, endDate);
                if (data == null)
                {
                    result = NotFound404(new ErrorResponse("No data found"));
                }
                else
                {
                    result = Ok200(new ItemsResponse<HotelOccupancyOverTimeResponse> { Items = data });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }

        [HttpGet("occupancy/room/{roomId:int}")]
        [EntityAuth(EntityTypeEnum.FinancialReports, EntityActionTypeEnum.Read, isBulk: true)]
        public ActionResult<ItemResponse<decimal>> GetRoomOccupancyByDateRange(
            string hotelId,
            int roomId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            ObjectResult result;
            try
            {
                var occupancy = _financialReportService.GetRoomOccupancyByDateRange(startDate, endDate, roomId);
                result = Ok200(new ItemResponse<decimal> { Item = occupancy });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                result = StatusCode(500, new ErrorResponse());
            }
            return result;
        }
    }
}