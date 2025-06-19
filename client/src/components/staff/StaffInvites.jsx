import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import InviteCard from "components/staff/StaffInviteCard";

import { getStaffInvitesByHotelId, deleteInvite } from "services/staffService";
import { INVITE_FLAGS_IDS } from "components/staff/constants";
import { useLanguage } from "contexts/LanguageContext";

const StaffInvites = () => {
  const [invites, setInvites] = useState({
    items: [],
    mapped: [],
  });
  const [loading, setLoading] = useState(true);
  const { hotelId } = useParams();
  const { t } = useLanguage();

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: t("staff.invites.deleteConfirmTitle"),
        text: t("staff.invites.deleteConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("staff.invites.deleteConfirmYes"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: t("staff.invites.deletingTitle"),
          text: t("staff.invites.deletingText"),
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
            title: t("staff.invites.deleteSuccessTitle"),
            text: t("staff.invites.deleteSuccessText"),
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: "error",
          title: t("common.error"),
          text: t("staff.invites.deleteError"),
        });
      }
    },
    [t]
  );

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

  const onGetInvitesError = useCallback(
    (err) => {
      if (err?.response?.status !== 404) {
        toast.error(t("staff.invites.loadError"));
      }
      setInvites({
        items: [],
        mapped: [],
      });
    },
    [t]
  );

  useEffect(() => {
    if (hotelId) {
      setLoading(true);
      getStaffInvitesByHotelId(hotelId)
        .then(onGetInvitesSuccess)
        .catch(onGetInvitesError)
        .finally(() => setLoading(false));
    }
  }, [hotelId, onGetInvitesError]);

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
      {invites.mapped.length > 0 ? (
        invites.mapped
      ) : (
        <Col xs="12" className="text-center">
          <p>{t("staff.invites.noInvites")}</p>
        </Col>
      )}
    </Row>
  );
};

export default StaffInvites;
