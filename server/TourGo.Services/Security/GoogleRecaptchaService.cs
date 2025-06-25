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
        private readonly HttpClient _httpClient;

        public GoogleRecaptchaService(
            IOptions<GoogleRecaptchaConfig> recaptchaConfig)
        {
            _recaptchaConfig = recaptchaConfig.Value;
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_recaptchaConfig.BaseUrl)
            };
        }

        public async Task<bool> VerifyTokenAsync(string token)
        {
            var requestData = new
            {
                secret = _recaptchaConfig.SecretKey,
                response = token
            };

            var response = await _httpClient.PostAsync("",
                new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("secret", requestData.secret),
                    new KeyValuePair<string, string>("response", requestData.response)
                }));

            if (!response.IsSuccessStatusCode)
                return false;

            var result = await response.Content.ReadFromJsonAsync<RecaptchaVerifyResponse>();
            return result?.Success ?? false;
        }
    }
}
