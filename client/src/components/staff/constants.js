import { Badge } from "reactstrap";
import { useLanguage } from "contexts/LanguageContext"; // added

export const INVITE_FLAGS_IDS = {
  CANCELLED: 0,
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 4,
};

// Returns a function that uses the t function from useLanguage
export const useFlagBadges = (flags) => {
  const { t } = useLanguage();
  const result = [];
  if (flags & INVITE_FLAGS_IDS.PENDING)
    result.push(
      <Badge color="success" key="active" className="me-1">
        {t("staff.inviteFlags.pending")}
      </Badge>
    );
  if (flags & INVITE_FLAGS_IDS.ACCEPTED)
    result.push(
      <Badge color="primary" key="accepted" className="me-1">
        {t("staff.inviteFlags.accepted")}
      </Badge>
    );
  if (flags & INVITE_FLAGS_IDS.REJECTED)
    result.push(
      <Badge color="danger" key="rejected" className="me-1">
        {t("staff.inviteFlags.rejected")}
      </Badge>
    );
  if (flags === INVITE_FLAGS_IDS.CANCELLED)
    result.push(
      <Badge color="secondary" key="none" className="me-1">
        {t("staff.inviteFlags.cancelled")}
      </Badge>
    );
  return result;
};
