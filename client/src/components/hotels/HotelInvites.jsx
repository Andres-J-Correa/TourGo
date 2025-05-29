import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";

import Breadcrumb from "components/commonUI/Breadcrumb";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import HotelInviteCard from "components/hotels/HotelInviteCard";
import VerifyAccountFallback from "components/commonUI/VerifyAccountFallback";

import { useAppContext } from "contexts/GlobalAppContext";
import {
  getUserInvites,
  acceptInvite,
  rejectInvite,
} from "services/staffService";
import { INVITE_FLAGS_IDS } from "components/staff/constants";

const breadcrumbs = [
  { label: "Inicio", path: "/" },
  { label: "Hoteles", path: "/hotels" },
];

function HotelInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAppContext();

  useEffect(() => {
    setLoading(true);
    getUserInvites()
      .then((res) => {
        if (res.isSuccessful) {
          setInvites(res.items);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error("Error al cargar las invitaciones");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAccept = async (inviteId) => {
    const result = await Swal.fire({
      title: "¿Aceptar invitación?",
      text: "¿Estás seguro de que deseas aceptar esta invitación?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aceptar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Aceptando invitación",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await acceptInvite(inviteId);
      if (res.isSuccessful) {
        setInvites((prev) => {
          const index = prev.findIndex((i) => i.id === inviteId);
          if (index === -1) return prev;
          const updatedInvites = [...prev];
          updatedInvites[index] = {
            ...updatedInvites[index],
            flags: INVITE_FLAGS_IDS.ACCEPTED,
          };
          return updatedInvites;
        });

        Swal.fire({
          icon: "success",
          title: "Invitación aceptada",
          text: "Has aceptado la invitación correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo aceptar la invitación, intente nuevamente.",
      });
    }
  };

  const handleReject = async (inviteId) => {
    const result = await Swal.fire({
      title: "¿Rechazar invitación?",
      text: "¿Estás seguro de que deseas rechazar esta invitación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Rechazando invitación",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await rejectInvite(inviteId);
      if (res.isSuccessful) {
        setInvites((prev) => {
          const index = prev.findIndex((i) => i.id === inviteId);
          if (index === -1) return prev;
          const updatedInvites = [...prev];
          updatedInvites[index] = {
            ...updatedInvites[index],
            flags: INVITE_FLAGS_IDS.REJECTED,
          };
          return updatedInvites;
        });

        Swal.fire({
          icon: "info",
          title: "Invitación rechazada",
          text: "Has rechazado la invitación correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo rechazar la invitación, intente nuevamente.",
      });
    }
  };

  if (!user.current.isVerified) {
    return (
      <>
        <Breadcrumb breadcrumbs={breadcrumbs} active="Invitaciones" />
        <h3>Invitaciones a hoteles</h3>
        <VerifyAccountFallback />
      </>
    );
  }

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Invitaciones" />
      <LoadingOverlay isVisible={loading} />
      <h3>Invitaciones a hoteles</h3>
      <ErrorBoundary>
        <p>
          Aquí puedes gestionar las invitaciones que tienes para unirte a un
          hotel
        </p>
        <div>
          {invites.length === 0 && !loading && (
            <div className="text-muted">No tienes invitaciones pendientes.</div>
          )}
          <Row>
            {invites.map((invite) => (
              <Col
                key={`invite-${invite.id}`}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="d-flex">
                <HotelInviteCard
                  invite={invite}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </Col>
            ))}
          </Row>
        </div>
      </ErrorBoundary>
    </>
  );
}

export default HotelInvites;
