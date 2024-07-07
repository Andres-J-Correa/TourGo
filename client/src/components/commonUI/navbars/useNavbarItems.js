import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "contexts/LanguageContext";

export const useNavbarItems = () => {
  const { t } = useLanguage();

  const navbarItems = [
    {
      name: t("common.cancel"),
      icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
      collapse: [
        {
          name: "landing pages1",
          collapse: [
            {
              name: "about-us1",
              path: "/landing-pages/about-us",
            },
            {
              name: "contact-us1",
              path: "/landing-pages/contact-us",
            },
            {
              name: "about-us1",
              path: "/landing-pages/about-us",
            },
            {
              name: "contact-us1",
              path: "/landing-pages/contact-us",
            },
            {
              name: "about-us1",
              path: "/landing-pages/about-us",
            },
            {
              name: "contact-us1",
              path: "/landing-pages/contact-us",
            },
            {
              name: "about-us1",
              path: "/landing-pages/about-us",
            },
            {
              name: "contact-us1",
              path: "/landing-pages/contact-us",
            },
          ],
        },
        {
          name: "profile",
          collapse: [
            {
              name: "testProfile1",
              path: "/profile",
            },
          ],
        },
      ],
    },
  ];

  return navbarItems;
};
