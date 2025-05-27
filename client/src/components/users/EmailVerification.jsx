import React from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import {
  requestEmailVerification,
  verifyEmail,
} from "services/userAuthService";
import Swal from "sweetalert2";

const EmailVerification = ({ user }) => {
  const handleRequestVerification = async () => {
    const result = await Swal.fire({
      title: "Solicitud de Verificación",
      text: "¿Deseas solicitar un nuevo código de verificación?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, solicitar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Enviando...",
        text: "Por favor, espera mientras se envía el código de verificación.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await requestEmailVerification();
      if (response?.isSuccessful) {
        Swal.fire({
          title: "Éxito",
          text: "Se ha enviado un nuevo código de verificación a tu correo.",
          icon: "success",
        });
      } else {
        throw new Error("Error al solicitar el código de verificación.");
      }
    } catch {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al solicitar el código de verificación. Por favor, inténtalo de nuevo más tarde.",
        icon: "error",
      });
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    const code = e.target.verificationCode.value;
    if (code.trim() === "") {
      Swal.fire({
        title: "Error",
        text: "Por favor, ingresa el código de verificación.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Estas seguro?",
      text: "Revisa que el código sea correcto antes de continuar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, verificar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Verificando...",
        text: "Por favor, espera mientras se verifica tu correo.",
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
          title: "Éxito",
          text: "Tu correo ha sido verificado exitosamente.",
          icon: "success",
          timer: 2000,
        });
      } else {
        throw new Error("Error al verificar el correo.");
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al verificar tu correo. Por favor, revisa el código e inténtalo de nuevo.",
        icon: "error",
      });
    }
  };

  return (
    <div>
      <h4>Verificación de Correo</h4>
      {user.current.isVerified ? (
        <p className="text-success">Tú correo está verificado ✅</p>
      ) : (
        <>
          <Button color="dark" onClick={handleRequestVerification}>
            Solicitar Código de Verificación
          </Button>

          <Form className="mt-4" onSubmit={handleVerifyEmail}>
            <FormGroup>
              <Label for="verificationCode">
                Ingrese el código de verificación
              </Label>
              <Input
                type="text"
                name="verificationCode"
                id="verificationCode"
                placeholder="00000000-0000-0000-0000-000000000000"
              />
            </FormGroup>
            <Button type="submit" color="success">
              Verificar
            </Button>
          </Form>
        </>
      )}
    </div>
  );
};

export default EmailVerification;
