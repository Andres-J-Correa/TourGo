import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "contexts/LanguageContext";

export const useNavbarItems = () => {
  const { t } = useLanguage();

  const adminItems = [
    {
      name: t("common.cancel"),
      icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
      main: true,
      capitalize: true,
      collapse: [
        {
          name: "landing pages1",
          capitalize: true,
          collapse: [
            {
              name: "about-us1",
              path: "/landing-pages/about-us",
              capitalize: true,
            },
            {
              name: "contact-us1",
              path: "/landing-pages/contact-us",
              capitalize: true,
            },
          ],
        },
        {
          name: "profile",
          capitalize: true,
          isAnonymous: true,
          collapse: [
            {
              name: "testProfile1",
              path: "/profile",
              capitalize: true,
            },
          ],
        },
      ],
    },
  ];

  return {
    adminItems,
  };
};
