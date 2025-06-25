using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TourGo.Models.Domain.Config;
using TourGo.Models.Responses;
using TourGo.Services.Interfaces.Security;

namespace TourGo.Services.Security
{
    public class GoogleRecaptchaService : IGoogleRecaptchaService
    {
        private readonly GoogleRecaptchaConfig _recaptchaConfig;
        private readonly IHttpClientFactory _httpClientFactory;

        public GoogleRecaptchaService(
            IOptions<GoogleRecaptchaConfig> recaptchaConfig,
            IHttpClientFactory httpClientFactory)
        {
            _recaptchaConfig = recaptchaConfig.Value;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> VerifyTokenAsync(string token)
        {
            var requestData = new[]
            {
                new KeyValuePair<string, string>("secret", _recaptchaConfig.SecretKey),
                new KeyValuePair<string, string>("response", token)
            };

            var httpClient = _httpClientFactory.CreateClient("GoogleRecaptcha");
            // BaseAddress is configured in Program.cs

            var response = await httpClient.PostAsync("",
                new FormUrlEncodedContent(requestData));

            if (!response.IsSuccessStatusCode)
                return false;

            var result = await response.Content.ReadFromJsonAsync<RecaptchaVerifyResponse>();
            return result?.Success ?? false;
        }
    }
}
