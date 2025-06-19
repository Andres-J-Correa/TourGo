// components/staff/InviteCard.jsx

import React from "react";
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";
import dayjs from "dayjs";
import { HOTEL_ROLES_BY_ID } from "components/hotels/constants";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { INVITE_FLAGS_IDS, useFlagBadges } from "components/staff/constants";
import { useLanguage } from "contexts/LanguageContext";

const StaffInviteCard = ({ invite, handleDeleteClick }) => {
  const { t } = useLanguage();
  const flags = useFlagBadges(invite.flags);
  return (
    <Card className="w-100">
      {(invite.flags & INVITE_FLAGS_IDS.PENDING) !== 0 && (
        <span
          className="position-absolute cursor-pointer top-right-icon"
          title={t("staff.inviteCard.cancelInvite")}
          onClick={() => handleDeleteClick(invite.id)}>
          <FontAwesomeIcon icon={faCircleXmark} color="tomato" size="lg" />
        </span>
      )}
      <CardBody className="p-3 position-relative">
        <CardTitle tag="h6" className="mb-1">
          <Row>
            <Col lg="auto">{invite.email}</Col>
            <Col lg="auto">{t(HOTEL_ROLES_BY_ID[invite.roleId])}</Col>
            <Col lg="auto">
              <strong className="mx-1">{t("staff.inviteCard.expires")}</strong>
              {dayjs(invite.expiration).format("DD/MM/YYYY h:mm a")}
            </Col>
            <Col lg="auto">
              <small>
                <strong>{t("staff.inviteCard.issuedBy")}</strong>{" "}
                {invite.issuedBy.firstName} {invite.issuedBy.lastName}
              </small>
            </Col>
            <Col className="text-end">{flags}</Col>
          </Row>
        </CardTitle>
      </CardBody>
    </Card>
  );
};

export default StaffInviteCard;
