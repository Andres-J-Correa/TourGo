import React from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import {
  requestEmailVerification,
  verifyEmail,
} from "services/userAuthService";
import Swal from "sweetalert2";
import { useLanguage } from "contexts/LanguageContext";

const EmailVerification = ({ user }) => {
  const { t } = useLanguage();
  const handleRequestVerification = async () => {
    const result = await Swal.fire({
      title: t("users.emailVerification.requestTitle"),
      text: t("users.emailVerification.requestText"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("users.emailVerification.requestConfirm"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: t("users.emailVerification.sendingTitle"),
        text: t("users.emailVerification.sendingText"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await requestEmailVerification();
      if (response?.isSuccessful) {
        Swal.fire({
          title: t("common.success"),
          text: t("users.emailVerification.sentText"),
          icon: "success",
        });
      } else {
        throw new Error("Error al solicitar el código de verificación.");
      }
    } catch {
      Swal.close();
      Swal.fire({
        title: t("common.error"),
        text: t("users.emailVerification.requestError"),
        icon: "error",
      });
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    const code = e.target.verificationCode.value;
    if (code.trim() === "") {
      Swal.fire({
        title: t("common.error"),
        text: t("users.emailVerification.codeRequired"),
        icon: "error",
        confirmButtonText: t("common.ok"),
      });
      return;
    }

    const result = await Swal.fire({
      title: t("users.emailVerification.confirmTitle"),
      text: t("users.emailVerification.confirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("users.emailVerification.confirmVerify"),
      cancelButtonText: t("common.cancel"),
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: t("users.emailVerification.verifyingTitle"),
        text: t("users.emailVerification.verifyingText"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await verifyEmail(code);
      if (response?.isSuccessful) {
        user.set((prev) => ({
          ...prev,
          isVerified: true,
        }));
        Swal.fire({
          title: t("common.success"),
          text: t("users.emailVerification.verifiedText"),
          icon: "success",
          timer: 2000,
        });
      } else {
        throw new Error("Error al verificar el correo.");
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: t("common.error"),
        text: t("users.emailVerification.verifyError"),
        icon: "error",
      });
    }
  };

  return (
    <div>
      <h4>{t("users.emailVerification.title")}</h4>
      {user.current.isVerified ? (
        <p className="text-success">{t("users.emailVerification.verified")}</p>
      ) : (
        <>
          <Button color="dark" onClick={handleRequestVerification}>
            {t("users.emailVerification.requestButton")}
          </Button>

          <Form className="mt-4" onSubmit={handleVerifyEmail}>
            <FormGroup>
              <Label for="verificationCode">
                {t("users.emailVerification.codeLabel")}
              </Label>
              <Input
                type="text"
                name="verificationCode"
                id="verificationCode"
                placeholder={t("users.emailVerification.codePlaceholder")}
              />
            </FormGroup>
            <Button type="submit" color="success">
              {t("users.emailVerification.verifyButton")}
            </Button>
          </Form>
        </>
      )}
    </div>
  );
};

export default EmailVerification;
