import React from "react";
import { Card, CardBody, CardTitle, Button } from "reactstrap";
import dayjs from "dayjs";
import { HOTEL_ROLES_BY_ID } from "components/hotels/constants";
import { INVITE_FLAGS_IDS, getFlagBadges } from "components/staff/constants";

const HotelInviteCard = ({ invite, onAccept, onReject }) => {
  const isPending = (invite.flags & INVITE_FLAGS_IDS.PENDING) !== 0;
  return (
    <Card className="mb-3 w-100 flex-fill">
      <div className="d-flex justify-content-end pt-1">
        {getFlagBadges(invite.flags)}
      </div>
      <CardBody className="pt-0">
        <CardTitle className="mb-2">
          Invitación a:
          <p className="mb-0 fw-bold">{invite.hotel?.name}</p>
        </CardTitle>
        <div>
          <div>
            Rol: <strong>{HOTEL_ROLES_BY_ID[invite.roleId]}</strong>
          </div>
          <div>
            Expira:
            <strong>
              {dayjs(invite.expiration).format("DD/MM/YYYY h:mm a")}
            </strong>
          </div>
        </div>
        <div className="mt-3 d-flex justify-content-between">
          <Button
            color="dark"
            size="sm"
            onClick={() => (isPending ? onAccept(invite.id) : null)}
            disabled={!isPending}>
            Aceptar
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => (isPending ? onReject(invite.id) : null)}
            disabled={!isPending}>
            Rechazar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default HotelInviteCard;
