import type { Breadcrumb } from "./Breadcrumbs.types";

class BreadcrumbBuilder {
  private breadcrumbs: Breadcrumb[] = [];

  constructor(private t: (key: string) => string) {}

  addHome(): this {
    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.home"),
      path: "/",
    });
    return this;
  }

  addHotels(): this {
    this.breadcrumbs.push({
      label: this.t("commonUI.breadcrumbs.hotels"),
      path: "/hotels",
    });
    return this;
  }

  addHotel(hotelId?: string): this {
    if (hotelId) {
      this.breadcrumbs.push({
        label: this.t("commonUI.breadcrumbs.hotel"),
        path: `/hotels/${hotelId}`,
      });
    }
    return this;
  }

  addBookings(hotelId?: string): this {
    if (hotelId) {
      this.breadcrumbs.push({
        label: this.t("commonUI.breadcrumbs.bookings"),
        path: `/hotels/${hotelId}/bookings`,
      });
    }
    return this;
  }

  addBooking(hotelId?: string, bookingId?: string): this {
    if (hotelId && bookingId) {
      this.breadcrumbs.push({
        label: this.t("commonUI.breadcrumbs.booking"),
        path: `/hotels/${hotelId}/bookings/${bookingId}`,
      });
    }
    return this;
  }

  build(): Breadcrumb[] {
    return this.breadcrumbs;
  }
}

export default BreadcrumbBuilder;
