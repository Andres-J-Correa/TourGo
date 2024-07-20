
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using sib_api_v3_sdk.Api;
using sib_api_v3_sdk.Client;
using sib_api_v3_sdk.Model;
using TourGo.Models;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Services.Interfaces.Email;
using Task = System.Threading.Tasks.Task;

namespace TourGo.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly BrevoConfig _brevoConfig;
        private readonly EmailConfig _emailConfig;
        private readonly TransactionalEmailsApi _emailsApi;
        private readonly ITemplateLoader _templateLoader;

        public EmailService(
            IWebHostEnvironment environment,
            IOptions<EmailConfig> emailConfig,
            IOptions<BrevoConfig> brevoConfig,
            TransactionalEmailsApi emailsApi,
            ITemplateLoader templateLoader)
        {
            _environment = environment;
            _emailConfig = emailConfig.Value;
            _brevoConfig = brevoConfig.Value;
            _templateLoader = templateLoader;
            _emailsApi = emailsApi;
        }

        public async Task UserPasswordReset(IUserAuthData user, string token)
        {
            try
            {
                var sender = new SendSmtpEmailSender(_brevoConfig.SenderName, _brevoConfig.SenderEmail);
                var recipient = new SendSmtpEmailTo(user.Email, user.FirstName);
                var recipients = new List<SendSmtpEmailTo> { recipient };

                string customLink = $"{_emailConfig.DomainUrl}/users/password/change?tokenId={token}";
                string htmlTemplate = _templateLoader.LoadTemplate("passwordReset.html");

                if (string.IsNullOrEmpty(htmlTemplate))
                {
                    throw new Exception("Error loading template");
                }

                htmlTemplate = htmlTemplate.Replace("Reset-Link-Insert", customLink)
                                           .Replace("Users-Name", user.FirstName)
                                           .Replace("Expiration-Time", $"{_emailConfig.TokenExpirationHours} hours");

                var sendSmtpEmail = new SendSmtpEmail(sender, recipients)
                {
                    Subject = "Reset your TourGo password",
                    HtmlContent = htmlTemplate,
                };

                await _emailsApi.SendTransacEmailAsync(sendSmtpEmail);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
