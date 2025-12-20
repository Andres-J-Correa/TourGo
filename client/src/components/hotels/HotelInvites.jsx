import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";

import { toast } from "react-toastify";
import { Col, Row } from "reactstrap";

import ErrorBoundary from "components/commonUI/ErrorBoundary";
import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import HotelInviteCard from "components/hotels/HotelInviteCard";
import VerifyAccountFallback from "components/commonUI/VerifyAccountFallback";

import { useAppContext } from "contexts/GlobalAppContext";
import {
  getUserInvites,
  acceptInvite,
  rejectInvite,
} from "services/staffService";
import { INVITE_FLAGS_IDS } from "components/staff/constants";
import { useLanguage } from "contexts/LanguageContext";
import BreadcrumbBuilder from "components/commonUI/BreadcrumbsBuilder";

function HotelInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAppContext();
  const { t } = useLanguage();

  const breadcrumbs = useMemo(
    () =>
      new BreadcrumbBuilder(t)
        .addHotel()
        .addActive(t("hotels.invites.breadcrumbActive"))
        .build(),
    [t]
  );

  useEffect(() => {
    setLoading(true);
    getUserInvites()
      .then((res) => {
        if (res.isSuccessful) {
          setInvites(res.items);
        }
      })
      .catch((error) => {
        if (
          error?.response?.status !== 404 &&
          error?.response?.status !== 403
        ) {
          toast.error(t("hotels.invites.loadError"));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t]);

  const handleAccept = async (inviteId) => {
    const result = await Swal.fire({
      title: t("hotels.invites.acceptTitle"),
      text: t("hotels.invites.acceptText"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("hotels.invites.acceptConfirm"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("hotels.invites.acceptingTitle"),
        text: t("hotels.invites.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await acceptInvite(inviteId);
      if (res.isSuccessful) {
        setInvites((prev) => {
          const index = prev.findIndex((i) => i.id === inviteId);
          if (index === -1) return prev;
          const updatedInvites = [...prev];
          updatedInvites[index] = {
            ...updatedInvites[index],
            flags: INVITE_FLAGS_IDS.ACCEPTED,
          };
          return updatedInvites;
        });

        Swal.fire({
          icon: "success",
          title: t("hotels.invites.acceptedTitle"),
          text: t("hotels.invites.acceptedText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("hotels.invites.acceptError"),
      });
    }
  };

  const handleReject = async (inviteId) => {
    const result = await Swal.fire({
      title: t("hotels.invites.rejectTitle"),
      text: t("hotels.invites.rejectText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("hotels.invites.rejectConfirm"),
      cancelButtonText: t("common.cancel"),
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: t("hotels.invites.rejectingTitle"),
        text: t("hotels.invites.pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await rejectInvite(inviteId);
      if (res.isSuccessful) {
        setInvites((prev) => {
          const index = prev.findIndex((i) => i.id === inviteId);
          if (index === -1) return prev;
          const updatedInvites = [...prev];
          updatedInvites[index] = {
            ...updatedInvites[index],
            flags: INVITE_FLAGS_IDS.REJECTED,
          };
          return updatedInvites;
        });

        Swal.fire({
          icon: "info",
          title: t("hotels.invites.rejectedTitle"),
          text: t("hotels.invites.rejectedText"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
      }
    } catch {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: t("common.error"),
        text: t("hotels.invites.rejectError"),
      });
    }
  };

  if (!user.current.isVerified) {
    return (
      <>
        {breadcrumbs}
        <h3>{t("hotels.invites.title")}</h3>
        <VerifyAccountFallback />
      </>
    );
  }

  return (
    <>
      {breadcrumbs}
      <LoadingOverlay isVisible={loading} />
      <h3>{t("hotels.invites.title")}</h3>
      <ErrorBoundary>
        <p>{t("hotels.invites.description")}</p>
        <div>
          {invites.length === 0 && !loading && (
            <div className="text-muted">{t("hotels.invites.noInvites")}</div>
          )}
          <Row>
            {invites.map((invite) => (
              <Col
                key={`invite-${invite.id}`}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="d-flex">
                <HotelInviteCard
                  invite={invite}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </Col>
            ))}
          </Row>
        </div>
      </ErrorBoundary>
    </>
  );
}

export default HotelInvites;
