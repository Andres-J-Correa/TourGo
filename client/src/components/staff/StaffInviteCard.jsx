// components/staff/InviteCard.jsx

import React from "react";
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";
import dayjs from "dayjs";
import { HOTEL_ROLES_BY_ID } from "components/hotels/constants";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { INVITE_FLAGS_IDS, getFlagBadges } from "components/staff/constants";

const StaffInviteCard = ({ invite, handleDeleteClick }) => {
  return (
    <Card className="w-100">
      {(invite.flags & INVITE_FLAGS_IDS.PENDING) !== 0 && (
        <span
          className="position-absolute cursor-pointer"
          style={{ top: "-0.75rem", right: "-0.6rem", zIndex: 1 }}
          title="Anular invitación"
          onClick={() => handleDeleteClick(invite.id)}>
          <FontAwesomeIcon icon={faCircleXmark} color="tomato" size="lg" />
        </span>
      )}
      <CardBody className="p-3 position-relative">
        <CardTitle tag="h6" className="mb-1">
          <Row>
            <Col lg="auto"> {invite.email}</Col>
            <Col lg="auto">{HOTEL_ROLES_BY_ID[invite.roleId]}</Col>
            <Col lg="auto">
              <strong className="mx-1">Expira:</strong>
              {dayjs(invite.expiration).format("DD/MM/YYYY h:mm a")}
            </Col>
            <Col lg="auto">
              <small>
                <strong>Emitida por:</strong> {invite.issuedBy.firstName}{" "}
                {invite.issuedBy.lastName}
              </small>
            </Col>
            <Col className="text-end">{getFlagBadges(invite.flags)}</Col>
          </Row>
        </CardTitle>
      </CardBody>
    </Card>
  );
};

export default StaffInviteCard;
