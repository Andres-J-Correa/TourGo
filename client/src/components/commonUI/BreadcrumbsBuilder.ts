import type { JSX } from "react";
import * as React from "react";
import type { Breadcrumb } from "./Breadcrumbs.types";

import Breadcrumbs from "./Breadcrumbs";

class BreadcrumbBuilder {
  private breadcrumbs: Breadcrumb[] = [];
  private activeLabel: string = "";

  constructor(private t: (key: string) => string) {}

  addHome(): this {
    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.home"),
      path: "/",
    });
    return this;
  }

  addHotels(): this {
    this.addHome();
    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.hotels"),
      path: "/hotels",
    });
    return this;
  }

  addUserProfile(): this {
    this.addHome();
    this.breadcrumbs.push({
      label: this.t("users.profile.breadcrumbActive"),
      path: "/profile",
    });
    return this;
  }

  addHotel(hotelId: string): this {
    this.addHotels();

    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.hotel"),
      path: `/hotels/${hotelId}`,
    });

    return this;
  }

  addBookings(hotelId: string): this {
    this.addHotel(hotelId);

    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.bookings"),
      path: `/hotels/${hotelId}/bookings`,
    });
    return this;
  }

  addBooking(hotelId: string, bookingId: string): this {
    this.addBookings(hotelId);
    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.booking"),
      path: `/hotels/${hotelId}/bookings/${bookingId}`,
    });
    return this;
  }

  addActive(label: string): this {
    this.activeLabel = label;
    return this;
  }

  build(): JSX.Element {
    return React.createElement(Breadcrumbs, {
      breadcrumbs: this.breadcrumbs,
      active: this.activeLabel,
    });
  }
}

export default BreadcrumbBuilder;
