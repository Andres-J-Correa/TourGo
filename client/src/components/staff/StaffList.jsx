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
import { HOTEL_ROLES } from "components/hotels/constants";

const StaffList = () => {
  const [staff, setStaff] = useState({
    items: [],
    mapped: [],
  });
  const [loading, setLoading] = useState(true);

  const { hotelId } = useParams();

  const handleDeleteClick = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "¿Está seguro?",
        text: "No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar personal",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: "Eliminando personal",
          text: "Por favor espera",
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
            title: "Personal eliminado",
            text: "El personal se ha eliminado correctamente",
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
          text: "No se pudo eliminar el personal, intente nuevamente.",
        });
      }
    },
    [hotelId]
  );

  const handleUpdateRoleClick = useCallback(
    async (staffId, currentRoleId) => {
      const inputOptions = {};
      HOTEL_ROLES.forEach((role) => {
        inputOptions[role.id] = role.name;
      });

      const { value: selectedRoleId, isConfirmed } = await Swal.fire({
        title: "Actualizar rol del personal",
        input: "select",
        inputOptions,
        inputValue: currentRoleId,
        showCancelButton: true,
        confirmButtonText: "Actualizar",
        cancelButtonText: "Cancelar",
        inputLabel: "Selecciona un nuevo rol",
        inputValidator: (value) => {
          if (!value) {
            return "Debes seleccionar un rol";
          } else if (Number(value) === Number(currentRoleId)) {
            return "El rol seleccionado es el mismo que el actual";
          }
        },
      });

      if (!isConfirmed || !selectedRoleId) return;

      try {
        Swal.fire({
          title: "Actualizando rol",
          text: "Por favor espera",
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
            title: "Rol actualizado",
            text: "El rol del personal se ha actualizado correctamente",
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
          text: "No se pudo actualizar el rol, intente nuevamente.",
        });
      }
    },
    [hotelId]
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

  const onGetStaffError = (err) => {
    if (err?.response?.status !== 404) {
      toast.error("Error al obtener el personal del hotel");
    }
    setStaff([]);
  };

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
  }, [hotelId]);

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
