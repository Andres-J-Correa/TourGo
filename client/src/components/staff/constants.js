import { Badge } from "reactstrap";

export const INVITE_FLAGS_IDS = {
  CANCELLED: 0,
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 4,
};

export const getFlagBadges = (flags) => {
  const result = [];
  if (flags & INVITE_FLAGS_IDS.PENDING)
    result.push(
      <Badge color="success" key="active" className="me-1">
        Pendiente
      </Badge>
    );
  if (flags & INVITE_FLAGS_IDS.ACCEPTED)
    result.push(
      <Badge color="primary" key="accepted" className="me-1">
        Aceptada
      </Badge>
    );
  if (flags & INVITE_FLAGS_IDS.REJECTED)
    result.push(
      <Badge color="danger" key="rejected">
        Rechazada
      </Badge>
    );
  if (flags === INVITE_FLAGS_IDS.CANCELLED)
    result.push(
      <Badge color="secondary" key="none">
        Anulada
      </Badge>
    );
  return result;
};
