import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import StaffCard from "components/staff/StaffCard";

import {
  getByHotelId,
  updateStaffRole,
  deleteStaff,
} from "services/staffService";
import { HOTEL_ROLES, HOTEL_ROLES_IDS } from "components/hotels/constants";
import { useLanguage } from "contexts/LanguageContext";

const StaffList = () => {
  const [staff, setStaff] = useState({
    items: [],
    mapped: [],
  });
  const [loading, setLoading] = useState(true);

  const { hotelId } = useParams();
  const { t } = useLanguage();

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: t("staff.list.deleteConfirmTitle"),
        text: t("staff.list.deleteConfirmText"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("staff.list.deleteConfirmYes"),
        cancelButtonText: t("common.cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: t("staff.list.deletingTitle"),
          text: t("staff.list.deletingText"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await deleteStaff(hotelId, id);
        if (response.isSuccessful) {
          setStaff((prev) => {
            const index = prev.items.findIndex((staff) => staff.id === id);
            if (index === -1) return prev;
            const items = [...prev.items];
            items.splice(index, 1);
            return {
              ...prev,
              items,
            };
          });
          Swal.fire({
            icon: "success",
            title: t("staff.list.deleteSuccessTitle"),
            text: t("staff.list.deleteSuccessText"),
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
          text: t("staff.list.deleteError"),
        });
      }
    },
    [hotelId, t]
  );

  const handleUpdateRoleClick = useCallback(
    async (staffId, currentRoleId) => {
      const inputOptions = {};
      HOTEL_ROLES.forEach((role) => {
        if (role.id === HOTEL_ROLES_IDS.OWNER) return;
        inputOptions[role.id] = t(role.name);
      });

      const { value: selectedRoleId, isConfirmed } = await Swal.fire({
        title: t("staff.list.updateRoleTitle"),
        input: "select",
        inputOptions,
        inputValue: currentRoleId,
        showCancelButton: true,
        confirmButtonText: t("staff.list.updateRoleConfirm"),
        cancelButtonText: t("common.cancel"),
        inputLabel: t("staff.list.updateRoleLabel"),
        inputValidator: (value) => {
          if (!value) {
            return t("staff.list.updateRoleRequired");
          } else if (Number(value) === Number(currentRoleId)) {
            return t("staff.list.updateRoleSame");
          }
        },
      });

      if (!isConfirmed || !selectedRoleId) return;

      try {
        Swal.fire({
          title: t("staff.list.updatingRoleTitle"),
          text: t("staff.list.updatingRoleText"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const response = await updateStaffRole(
          hotelId,
          staffId,
          selectedRoleId
        );
        if (response.isSuccessful) {
          setStaff((prev) => {
            const items = prev.items.map((s) =>
              s.id === staffId ? { ...s, roleId: selectedRoleId } : s
            );
            return { ...prev, items };
          });
          Swal.fire({
            icon: "success",
            title: t("staff.list.updateRoleSuccessTitle"),
            text: t("staff.list.updateRoleSuccessText"),
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
          text: t("staff.list.updateRoleError"),
        });
      }
    },
    [hotelId, t]
  );

  const mapStaff = useCallback(
    (staff, i) => {
      return (
        <Col
          sm="12"
          md="6"
          lg="4"
          className="mb-4 d-flex"
          key={`${staff.id}-${i}`}>
          <StaffCard
            staff={staff}
            handleDeleteClick={handleDeleteClick}
            handleUpdateRoleClick={handleUpdateRoleClick}
          />
        </Col>
      );
    },
    [handleDeleteClick, handleUpdateRoleClick]
  );

  const onGetStaffSuccess = (res) => {
    if (res.isSuccessful) {
      setStaff((prev) => ({
        ...prev,
        items: res.items,
      }));
    }
  };

  const onGetStaffError = useCallback(
    (err) => {
      if (err?.response?.status !== 404) {
        toast.error(t("staff.list.loadError"));
      }
      setStaff([]);
    },
    [t]
  );

  useEffect(() => {
    if (hotelId) {
      setLoading(true);
      getByHotelId(hotelId)
        .then(onGetStaffSuccess)
        .catch(onGetStaffError)
        .finally(() => {
          setLoading(false);
        });
    }
  }, [hotelId, onGetStaffError]);

  useEffect(() => {
    if (staff.items.length > 0) {
      setStaff((prev) => ({
        ...prev,
        mapped: prev.items.map(mapStaff),
      }));
    }
  }, [staff.items, mapStaff]);

  return (
    <Row>
      <LoadingOverlay isVisible={loading} />
      {staff.mapped}
    </Row>
  );
};

export default StaffList;
