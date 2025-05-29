import React, { useMemo } from "react";
import { Card, CardBody, CardTitle, CardSubtitle, Button } from "reactstrap";
import { useAppContext } from "contexts/GlobalAppContext";

import {
  HOTEL_ROLES_BY_ID,
  HOTEL_ROLES_IDS,
} from "components/hotels/constants";

function StaffCard({ staff, handleDeleteClick, handleUpdateRoleClick }) {
  const { user, hotel } = useAppContext();

  const isOwner = useMemo(
    () =>
      user.current.id === staff.id &&
      hotel.current.roleId === HOTEL_ROLES_IDS.OWNER,
    [user, hotel, staff]
  );

  return (
    <Card className="flex-fill d-flex flex-column">
      <CardBody className="text-center d-flex flex-column">
        <div className="mb-3">
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#ddd",
              borderRadius: "50%",
              display: "inline-block",
              lineHeight: "80px",
              fontSize: "0.9rem",
              color: "#888",
            }}>
            Img
          </div>
        </div>
        <CardTitle tag="h5">
          {staff.firstName} {staff.lastName}
        </CardTitle>
        <CardSubtitle className="mb-2 text-muted">{staff.email}</CardSubtitle>
        <p className="mb-2">
          <strong>Rol:</strong> {HOTEL_ROLES_BY_ID[staff.roleId]}
        </p>
        {!isOwner && (
          <div className="mt-auto">
            <Button
              color="dark"
              className="me-2"
              onClick={() => handleUpdateRoleClick(staff.id, staff.roleId)}>
              Cambiar Rol
            </Button>
            <Button color="danger" onClick={() => handleDeleteClick(staff.id)}>
              Eliminar
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default StaffCard;
