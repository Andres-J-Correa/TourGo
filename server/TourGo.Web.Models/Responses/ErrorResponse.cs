
using TourGo.Web.Models.Enums;

namespace TourGo.Web.Models.Responses
{
    public class ErrorResponse : BaseResponse
    {
        public List<string> Errors { get; set; }

        public int Code { get; set; } = (int)BaseErrorCode.UnknownError;

        public ErrorResponse()
        {
            Errors = new List<string>();
            Errors.Add("An unexpected error occurred while processing your request.");
            this.IsSuccessful = false;
        }
        public ErrorResponse(string errMsg)
        {
            Errors = new List<string>();
            Errors.Add(errMsg);
            this.IsSuccessful = false;
        }

        public ErrorResponse(IEnumerable<string> errMsg)
        {
            Errors = new List<string>();
            Errors.AddRange(errMsg);
            this.IsSuccessful = false;
        }

        public ErrorResponse(string errMsg, BaseErrorCode baseCode)
        {
            Errors = new List<string>();
            Errors.Add(errMsg);
            this.Code = (int)baseCode;
            this.IsSuccessful = false;
        }

        public ErrorResponse(string errMsg, Enum specificCode)
        {
            Errors = new List<string>();
            Errors.Add(errMsg);
            this.Code = Convert.ToInt32(specificCode);
            this.IsSuccessful = false;
        }

        public ErrorResponse(IEnumerable<string> errMsg, BaseErrorCode baseCode)
        {
            Errors = new List<string>();
            Errors.AddRange(errMsg);
            this.Code = (int)baseCode;
            this.IsSuccessful = false;
        }

        public ErrorResponse(IEnumerable<string> errMsg, Enum specificCode)
        {
            Errors = new List<string>();
            Errors.AddRange(errMsg);
            this.Code = Convert.ToInt32(specificCode);
            this.IsSuccessful = false;
        }
    }
}