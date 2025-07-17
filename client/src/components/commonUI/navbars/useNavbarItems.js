import {
  faHotel,
  faCalendarCheck,
  faBed,
  faUsers,
  faCashRegister,
  faCogs,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "contexts/GlobalAppContext";
import { HOTEL_ROLES_IDS } from "components/hotels/constants";
import { useLanguage } from "contexts/LanguageContext"; // added

export const useNavbarItems = () => {
  const { hotel } = useAppContext();
  const { t } = useLanguage(); // added
  const isUserAdmin =
    hotel.current.roleId === HOTEL_ROLES_IDS.ADMIN ||
    hotel.current.roleId === HOTEL_ROLES_IDS.OWNER;

  const hotelsItems = [
    {
      name: t("commonUI.navbar.hotels"),
      icon: faHotel,
      capitalize: true,
      collapse: [
        {
          name: t("commonUI.navbar.shortcuts"),
          capitalize: true,
          collapse: [
            {
              name: t("commonUI.navbar.invites"),
              path: "/hotels/invites",
              capitalize: true,
            },
            {
              name: t("commonUI.navbar.hotelsList"),
              path: "/hotels",
            },
            {
              name: t("commonUI.navbar.registerHotel"),
              path: "/hotels/add",
            },
          ],
        },
      ],
    },
  ];

  let currentHotelItems = [];

  if (hotel.current?.id && !hotel.isLoading) {
    currentHotelItems = [
      {
        name: t("commonUI.navbar.bookings"),
        icon: faCalendarCheck,
        position: "left",
        capitalize: true,
        desktopOnly: true,
        collapse: [
          {
            name: t("commonUI.navbar.shortcuts"),
            capitalize: true,
            collapse: [
              {
                name: t("commonUI.navbar.newBooking"),
                path: `/hotels/${hotel.current.id}/bookings/new`,
                capitalize: true,
              },
              {
                name: t("commonUI.navbar.bookingsList"),
                path: `/hotels/${hotel.current.id}/bookings`,
              },
            ],
          },
        ],
      },
      {
        name: t("commonUI.navbar.calendar"),
        icon: faCalendarDays,
        position: "left",
        path: `/hotels/${hotel.current.id}/calendar`,
        capitalize: true,
        desktopOnly: true,
      },
      {
        name: t("commonUI.navbar.transactions"),
        icon: faCashRegister,
        position: "left",
        path: `/hotels/${hotel.current.id}/transactions`,
        capitalize: true,
        desktopOnly: true,
      },
      {
        name: t("commonUI.navbar.manageDetails"),
        icon: faBed,
        position: "left",
        capitalize: true,
        collapse: [
          {
            name: t("commonUI.navbar.lodgingAndCharges"),
            capitalize: true,
            collapse: [
              {
                name: t("commonUI.navbar.rooms"),
                path: `/hotels/${hotel.current.id}/rooms`,
                capitalize: true,
              },
              {
                name: t("commonUI.navbar.extraCharges"),
                path: `/hotels/${hotel.current.id}/extra-charges`,
                capitalize: true,
              },
              {
                name: t("commonUI.navbar.bookingProviders"),
                path: `/hotels/${hotel.current.id}/booking-providers`,
              },
            ],
          },

          {
            name: t("commonUI.navbar.financials"),
            capitalize: true,
            collapse: [
              {
                name: t("commonUI.navbar.paymentMethods"),
                path: `/hotels/${hotel.current.id}/payment-methods`,
              },
              {
                name: t("commonUI.navbar.transactionSubcategories"),
                path: `/hotels/${hotel.current.id}/transaction-subcategories`,
              },
              {
                name: t("commonUI.navbar.financePartners"),
                path: `/hotels/${hotel.current.id}/finance-partners`,
                capitalize: true,
              },
            ],
          },
        ],
      },
      ...(hotel.current.roleId === HOTEL_ROLES_IDS.OWNER
        ? [
            {
              name: t("commonUI.navbar.staff"),
              icon: faUsers,
              position: "left",
              path: `/hotels/${hotel.current.id}/staff`,
              capitalize: true,
            },
          ]
        : []),
      ...(isUserAdmin
        ? [
            {
              name: t("commonUI.navbar.admin"),
              icon: faCogs,
              position: "left",
              capitalize: true,
              collapse: [
                {
                  name: t("commonUI.navbar.shortcuts"),
                  capitalize: true,
                  collapse: [
                    {
                      name: t("commonUI.navbar.hotelSettings"),
                      path: `/hotels/${hotel.current.id}/settings?tab=edit`,
                    },
                  ],
                },
                {
                  name: t("commonUI.navbar.finances"),
                  capitalize: true,
                  collapse: [
                    {
                      name: t("commonUI.navbar.financeDashboard"),
                      path: `/hotels/${hotel.current.id}/finance-dashboard`,
                    },
                  ],
                },
              ],
            },
          ]
        : []),
    ];
  }
  const items = [...currentHotelItems, ...hotelsItems];

  return {
    items,
  };
};
