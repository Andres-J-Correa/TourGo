using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TourGo.Data.Providers;
using TourGo.Models.Requests;
using TourGo.Services.Interfaces;

namespace TourGo.Services
{
    public class ErrorLoggingService : IErrorLoggingService
    {
        readonly private IMySqlDataProvider _dataProvider;
        readonly private ILogger<ErrorLoggingService> _logger;

        public ErrorLoggingService(IMySqlDataProvider dataProvider, ILogger<ErrorLoggingService> logger)
        {
            _dataProvider = dataProvider;
            _logger = logger;
        }

        public void LogError(ErrorLogRequest request)
        {
            string proc = "error_logs_insert";

            try
            {
                _dataProvider.ExecuteNonQuery(proc, (col) =>
                {
                    col.AddWithValue("p_message", request.Message);
                    col.AddWithValue("p_stackTrace", request.StackTrace);
                    col.AddWithValue("p_source", request.Source);
                    col.AddWithValue("p_path", request.Path);
                    col.AddWithValue("p_method", request.Method);
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
        }
    }
}
