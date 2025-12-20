import { lazy } from "react";

export const privateRoutes = [
  {
    path: "profile",
    children: [
      {
        index: true,
        Component: lazy(() => import("components/users/UserProfile")),
      },
      {
        path: "settings",
        Component: lazy(() => import("components/users/UserSettings")),
      },
    ],
  },
  {
    path: "hotels",
    children: [
      {
        index: true,
        Component: lazy(() => import("components/hotels/HotelsView")),
      },
      {
        path: "add",
        Component: lazy(() => import("components/hotels/HotelAdd")),
      },
      {
        path: "invites",
        Component: lazy(() => import("components/hotels/HotelInvites")),
      },
      {
        path: ":hotelId",
        children: [
          {
            index: true,
            Component: lazy(() => import("components/hotels/LandingPage")),
          },
          {
            path: "settings",
            Component: lazy(() => import("components/hotels/HotelSettings")),
          },
          {
            path: "calendar",
            Component: lazy(() =>
              import("components/bookings/calendarV2/CalendarView")
            ),
          },
          {
            path: "customers",
            Component: lazy(() =>
              import("components/commonUI/fallback/SiteUnderConstruction")
            ),
          },
          {
            path: "staff",
            Component: lazy(() => import("components/staff/StaffView")),
          },
          {
            path: "payment-methods",
            Component: lazy(() =>
              import(
                "components/transactions/payment-methods/PaymentMethodsView"
              )
            ),
          },
          {
            path: "finance-partners",
            Component: lazy(() =>
              import(
                "components/transactions/finance-partners/FinancePartnersView"
              )
            ),
          },
          {
            path: "booking-providers",
            Component: lazy(() =>
              import("components/bookings/BookingProvidersView")
            ),
          },
          {
            path: "rooms",
            Component: lazy(() => import("components/rooms/RoomsView")),
          },
          {
            path: "extra-charges",
            Component: lazy(() =>
              import("components/extra-charges/ExtraChargesView")
            ),
          },
          {
            path: "finance-dashboard",
            Component: lazy(() =>
              import("components/financial-reports/FinanceDashboard")
            ),
          },
          {
            path: "transactions",
            Component: lazy(() =>
              import(
                "components/transactions/transactions-view/TransactionsView"
              )
            ),
          },
          {
            path: "transaction-subcategories",
            Component: lazy(() =>
              import(
                "components/transactions/subcategories/TransactionSubcategoriesView"
              )
            ),
          },
          {
            path: "invoices/:invoiceId",
            Component: lazy(() => import("components/invoices/InvoiceView")),
          },
          {
            path: "bookings",
            children: [
              {
                index: true,
                Component: lazy(() =>
                  import("components/bookings/bookings-view/BookingsViewV2")
                ),
              },
              {
                path: "new",
                Component: lazy(() =>
                  import(
                    "components/bookings/booking-add-edit-view/BookingAddUpdateView"
                  )
                ),
              },
              {
                path: "newV2",
                Component: lazy(() =>
                  import(
                    "components/bookings/booking-add-edit-view-v2/BookingAddEditView"
                  )
                ),
              },
              {
                path: "quote",
                Component: lazy(() =>
                  import(
                    "components/bookings/booking-quote-view/BookingQuoteView"
                  )
                ),
              },
              {
                path: ":bookingId",
                children: [
                  {
                    index: true,
                    Component: lazy(() =>
                      import("components/bookings/BookingView")
                    ),
                  },
                  {
                    path: "edit",
                    Component: lazy(() =>
                      import(
                        "components/bookings/booking-add-edit-view/BookingAddUpdateView"
                      )
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
