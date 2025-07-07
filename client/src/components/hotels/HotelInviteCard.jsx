import { useMemo } from "react";
import { Card, CardBody, CardTitle, Button } from "reactstrap";
import dayjs from "dayjs";
import { HOTEL_ROLES_BY_ID } from "components/hotels/constants";
import { INVITE_FLAGS_IDS, useFlagBadges } from "components/staff/constants";
import { useLanguage } from "contexts/LanguageContext"; // added

const HotelInviteCard = ({ invite, onAccept, onReject }) => {
  const { t } = useLanguage(); // added
  const isPending = useMemo(
    () => (invite.flags & INVITE_FLAGS_IDS.PENDING) !== 0,
    [invite.flags]
  );
  const isExpired = useMemo(
    () => dayjs(invite.expiration).isBefore(dayjs()),
    [invite.expiration]
  );

  const flags = useFlagBadges(invite.flags, isExpired);
  return (
    <Card className="mb-3 w-100 flex-fill">
      <div className="d-flex justify-content-end pt-1">{flags}</div>
      <CardBody className="pt-0">
        <CardTitle className="mb-2">
          {t("hotels.inviteCard.invitationTo")}
          <p className="mb-0 fw-bold">{invite.hotel?.name}</p>
        </CardTitle>
        <div>
          <div>
            {t("hotels.inviteCard.role")}:{" "}
            <strong>{t(HOTEL_ROLES_BY_ID[invite.roleId])}</strong>
          </div>
          <div>
            {t("hotels.inviteCard.expires")}:
            <strong>
              {dayjs(invite.expiration).format("DD/MM/YYYY h:mm a")}
            </strong>
          </div>
        </div>
        <div className="mt-3 d-flex justify-content-between">
          <Button
            color="dark"
            size="sm"
            onClick={() =>
              isPending && !isExpired ? onAccept(invite.id) : null
            }
            disabled={!isPending || isExpired}>
            {t("hotels.inviteCard.accept")}
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() =>
              isPending && !isExpired ? onReject(invite.id) : null
            }
            disabled={!isPending || isExpired}>
            {t("hotels.inviteCard.reject")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default HotelInviteCard;
