
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using sib_api_v3_sdk.Api;
using sib_api_v3_sdk.Model;
using TourGo.Models;
using TourGo.Models.Domain.Config.Emails;
using TourGo.Models.Requests;
using TourGo.Services.Interfaces;
using TourGo.Services.Interfaces.Email;
using Task = System.Threading.Tasks.Task;

namespace TourGo.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly BrevoConfig _brevoConfig;
        private readonly EmailConfig _emailConfig;
        private readonly TransactionalEmailsApi _emailsApi;
        private readonly ITemplateService _templateService;

        public EmailService(
            IOptions<EmailConfig> emailConfig,
            IOptions<BrevoConfig> brevoConfig,
            TransactionalEmailsApi emailsApi,
            ITemplateService templateService)
        {
            _emailConfig = emailConfig.Value;
            _brevoConfig = brevoConfig.Value;
            _templateService = templateService;
            _emailsApi = emailsApi;
        }

        public async Task UserPasswordReset(IUserAuthData user, string token)
        {
            try
            {
                var sender = new SendSmtpEmailSender(_brevoConfig.SenderName, _brevoConfig.SenderEmail);
                var recipient = new SendSmtpEmailTo(user.Email, user.FirstName);
                var recipients = new List<SendSmtpEmailTo> { recipient };

                string htmlTemplate = await _templateService.GetTemplateByName("password-reset");

                if (string.IsNullOrEmpty(htmlTemplate))
                {
                    throw new Exception("Error loading template");
                }

                htmlTemplate = htmlTemplate.Replace("Verification-Code", token)
                                           .Replace("User-Name", user.FirstName)
                                           .Replace("Expiration-Time", $"{_emailConfig.PasswordResetExpirationHours} horas");

                var sendSmtpEmail = new SendSmtpEmail(sender, recipients)
                {
                    Subject = "TourGo - Reestablecer contraseña",
                    HtmlContent = htmlTemplate,
                };

                await _emailsApi.SendTransacEmailAsync(sendSmtpEmail);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task UserEmailVerification(IUserAuthData user, string token)
        {
            try
            {
                var sender = new SendSmtpEmailSender(_brevoConfig.SenderName, _brevoConfig.SenderEmail);
                var recipient = new SendSmtpEmailTo(user.Email, user.FirstName);
                var recipients = new List<SendSmtpEmailTo> { recipient };

                string htmlTemplate = await _templateService.GetTemplateByName("email-verification");

                if (string.IsNullOrEmpty(htmlTemplate))
                {
                    throw new Exception("Error loading template");
                }

                htmlTemplate = htmlTemplate.Replace("Verification-Code", token)
                                           .Replace("User-Name", user.FirstName)
                                           .Replace("Expiration-Time", $"{_emailConfig.EmailVerificationExpirationHours} horas");

                var sendSmtpEmail = new SendSmtpEmail(sender, recipients)
                {
                    Subject = "TourGo - Verificar Correo",
                    HtmlContent = htmlTemplate,
                };

                await _emailsApi.SendTransacEmailAsync(sendSmtpEmail);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task HotelStaffInvitation(string email, string hotel, string role)
        {
            try
            {
                var sender = new SendSmtpEmailSender(_brevoConfig.SenderName, _brevoConfig.SenderEmail);
                var recipient = new SendSmtpEmailTo(email);
                var recipients = new List<SendSmtpEmailTo> { recipient };
                string invitationLink = $"{_emailConfig.DomainUrl}/hotels/invites";

                string htmlTemplate = await _templateService.GetTemplateByName("staff-invitation");

                if (string.IsNullOrEmpty(htmlTemplate))
                {
                    throw new Exception("Error loading template");
                }

                htmlTemplate = htmlTemplate.Replace("Hotel-Name", hotel)
                                           .Replace("Role-Name", role)
                                           .Replace("Invitation-Link", invitationLink);

                var sendSmtpEmail = new SendSmtpEmail(sender, recipients)
                {
                    Subject = "TourGo - Invitación a Hotel",
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
