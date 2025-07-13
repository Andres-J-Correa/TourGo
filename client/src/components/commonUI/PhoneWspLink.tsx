//types
import type { JSX } from "react";

//libs
import Swal from "sweetalert2";
import { isValidPhoneNumber } from "libphonenumber-js";

//services & utils
import { formatPhoneNumber } from "utils/phoneHelper";
import { useLanguage } from "contexts/LanguageContext";

function PhoneWspLink({ phone }: { phone: string }): JSX.Element {
  const { t } = useLanguage();

  if (!phone) {
    return <span>N/A</span>;
  }

  const getWhatsappLink = (): string => {
    const cleaned = phone.replace(/\D/g, "");
    return `https://api.whatsapp.com/send?phone=${cleaned}`;
  };

  const handlePhoneClick = (e: React.MouseEvent<HTMLSpanElement>): void => {
    e.preventDefault();

    if (!isValidPhoneNumber(phone)) {
      Swal.fire({
        icon: "error",
        title: t("commonUI.phoneWspLink.invalidPhoneSwalTitle"),
        text: t("commonUI.phoneWspLink.invalidPhoneSwalText"),
      });
      return;
    }
    const whatsappLink = getWhatsappLink();
    window.open(whatsappLink, "_blank");
  };

  return (
    <span className="link-primary cursor-pointer" onClick={handlePhoneClick}>
      {formatPhoneNumber(phone)}
    </span>
  );
}

export default PhoneWspLink;
