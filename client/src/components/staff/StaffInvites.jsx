import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import InviteCard from "components/staff/StaffInviteCard";

import { getStaffInvitesByHotelId, deleteInvite } from "services/staffService";
import { INVITE_FLAGS_IDS } from "components/staff/constants";

const StaffInvites = () => {
  const [invites, setInvites] = useState({
    items: [],
    mapped: [],
  });
  const [loading, setLoading] = useState(true);
  const { hotelId } = useParams();

  const handleDeleteClick = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular invitación",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Anulando la invitación",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await deleteInvite(id);
      if (response.isSuccessful) {
        setInvites((prev) => {
          const index = prev.items.findIndex((invite) => invite.id === id);
          if (index === -1) return prev;
          const items = [...prev.items];
          const invite = items[index];
          items.splice(index, 1);
          items.push({
            ...invite,
            flags: INVITE_FLAGS_IDS.CANCELLED,
          });
          return {
            ...prev,
            items,
          };
        });
        Swal.fire({
          icon: "success",
          title: "Invitación anulada",
          text: "La invitación se ha anulado correctamente",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo anular la invitación, intente nuevamente.",
      });
    }
  }, []);

  const mapInvite = useCallback(
    (invite, i) => (
      <Col xs="12" className="my-2" key={`${invite.id}-${i}`}>
        <InviteCard invite={invite} handleDeleteClick={handleDeleteClick} />
      </Col>
    ),
    [handleDeleteClick]
  );

  const onGetInvitesSuccess = (res) => {
    if (res.isSuccessful) {
      setInvites((prev) => ({
        ...prev,
        items: res.items,
      }));
    }
  };

  const onGetInvitesError = (err) => {
    if (err?.response?.status !== 404) {
      toast.error("Error al obtener las invitaciones del hotel");
    }
    setInvites({
      items: [],
      mapped: [],
    });
  };

  useEffect(() => {
    if (hotelId) {
      setLoading(true);
      getStaffInvitesByHotelId(hotelId)
        .then(onGetInvitesSuccess)
        .catch(onGetInvitesError)
        .finally(() => setLoading(false));
    }
  }, [hotelId]);

  useEffect(() => {
    if (invites.items.length > 0) {
      setInvites((prev) => ({
        ...prev,
        mapped: prev.items.map(mapInvite),
      }));
    }
  }, [invites.items, mapInvite]);

  return (
    <Row>
      <LoadingOverlay isVisible={loading} />
      {invites.mapped}
    </Row>
  );
};

export default StaffInvites;
