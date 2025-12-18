//types
import type { JSX } from "react";
import type { BookingFiltersProps } from "./BookingFiltersV2.types";

//libs
import { useState } from "react";
import { Row, Col, Label, Input, InputGroup, Button, Form } from "reactstrap";
import {
  faBroom,
  faMagnifyingGlass,
  faPlaneArrival,
  faPlaneDeparture,
  faArrowUpShortWide,
  faArrowDownShortWide,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";

//components
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";

//services & utils
import { BOOKING_STATUSES } from "components/bookings/constants";
import { useLanguage } from "contexts/LanguageContext";
import { BOOKING_VIEW_SORT_OPTIONS } from "./constants";

function BookingFiltersV2({
  paginationData,
  loading,
  handleDateChange,
  handleFilterByCustomerName,
  handleFilterByExternalBookingId,
  handleClearCustomerNameFilter,
  handleClearExternalBookingIdFilter,
  toggleDateType,
  handleFilterByStatusId,
  onPageSizeChange,
  handleFilterByBookingId,
  handleClearBookingIdFilter,
  toggleSortDirection,
  onSortColumnChange,
}: BookingFiltersProps): JSX.Element {
  const [customerNameInputs, setCustomerNameInputs] = useState<{
    firstName: string;
    lastName: string;
  }>({
    firstName: "",
    lastName: "",
  });
  const [externalBookingIdInput, setExternalBookingIdInput] =
    useState<string>("");

  const [bookingIdInput, setBookingIdInput] = useState<string>("");

  const { t } = useLanguage();

  const pageSizeOptions: number[] = [5, 10, 20, 50, 100, 200, 500];

  const handleBookingIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value }: { value: string } = e.target;
    setBookingIdInput(value.trim());
  };

  const onClearBookingIdFilter = (): void => {
    setBookingIdInput("");
    if (!paginationData.bookingId) return;
    handleClearBookingIdFilter();
  };

  const handleBookingIdFilterSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    if (!bookingIdInput) return;
    handleFilterByBookingId(bookingIdInput);
  };

  const handleCustomerNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value }: { name: string; value: string } = e.target;
    setCustomerNameInputs((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const onClearCustomerNameFilter = (): void => {
    setCustomerNameInputs({ firstName: "", lastName: "" });
    if (!paginationData.firstName && !paginationData.lastName) return;
    handleClearCustomerNameFilter();
  };

  const handleExternalBookingIdChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value }: { value: string } = e.target;
    setExternalBookingIdInput(value.trim());
  };

  const onClearExternalBookingIdFilter = (): void => {
    setExternalBookingIdInput("");
    if (!paginationData.externalBookingId) return;
    handleClearExternalBookingIdFilter();
  };

  const handleCustomerNameFilterSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    const { firstName, lastName } = customerNameInputs;
    if (!firstName && !lastName) return;
    handleFilterByCustomerName(customerNameInputs);
  };

  const handleExternalBookingIdFilterSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    if (!externalBookingIdInput) return;
    handleFilterByExternalBookingId(externalBookingIdInput);
  };

  const handlePageSizeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value }: { value: string } = e.target;
    const newPageSize: number = Number(value);
    if (isNaN(newPageSize) || newPageSize <= 0) return;
    onPageSizeChange(newPageSize);
  };

  const handleSortcolumnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { value }: { value: string } = e.target;
    onSortColumnChange(value as keyof typeof BOOKING_VIEW_SORT_OPTIONS);
  };

  return (
    <>
      <Row>
        <Col md={6} xl={4}>
          <DatePickersV2
            startDate={paginationData.startDate}
            endDate={paginationData.endDate}
            handleStartChange={handleDateChange("startDate")}
            handleEndChange={handleDateChange("endDate")}
            disabled={loading}
            allowSameDay={true}
          />
        </Col>
        <Col className="align-content-end mb-3" xs="auto">
          {(paginationData.startDate || paginationData.endDate) && (
            <div>
              <button
                className={classNames("btn", {
                  "btn-dark": paginationData.isArrivalDate,
                  "btn-info": !paginationData.isArrivalDate,
                })}
                type="button"
                onClick={toggleDateType}
                disabled={loading}
                title={`${t("booking.filters.filteringBy")} ${
                  paginationData.isArrivalDate
                    ? t("booking.filters.arrival")
                    : t("booking.filters.departure")
                }`}>
                <FontAwesomeIcon
                  icon={
                    paginationData.isArrivalDate
                      ? faPlaneArrival
                      : faPlaneDeparture
                  }
                />
              </button>
            </div>
          )}
        </Col>
        <Col md={6} xl={4} className="mb-3">
          <Form onSubmit={handleCustomerNameFilterSubmit}>
            <Label for="firstName" className="text-dark">
              {t("booking.filters.filterByCustomerName")}
            </Label>
            <InputGroup>
              <Input
                id="firstName"
                type="text"
                aria-label="First name"
                placeholder={t("booking.filters.firstName")}
                name="firstName"
                onChange={handleCustomerNameChange}
                value={customerNameInputs?.firstName}
              />
              <Input
                type="text"
                aria-label="Last name"
                placeholder={t("booking.filters.lastName")}
                name="lastName"
                onChange={handleCustomerNameChange}
                value={customerNameInputs?.lastName}
              />
              <Button
                title={t("booking.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("booking.filters.clear")}
                onClick={onClearCustomerNameFilter}
                disabled={
                  loading ||
                  (!customerNameInputs.firstName &&
                    !customerNameInputs.lastName)
                }>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6} xl="auto" className="mb-3">
          <Form onSubmit={handleBookingIdFilterSubmit}>
            <Label for="bookingId" className="text-dark">
              {t("booking.filters.filterByBookingId")}
            </Label>
            <InputGroup>
              <Input
                id="bookingId"
                type="text"
                maxLength={12}
                placeholder={t("booking.filters.bookingIdPlaceholder")}
                value={bookingIdInput}
                onChange={handleBookingIdChange}
              />
              <Button
                title={t("booking.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("booking.filters.clear")}
                onClick={onClearBookingIdFilter}
                disabled={loading || !bookingIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6} xl="auto" className="mb-3">
          <Form onSubmit={handleExternalBookingIdFilterSubmit}>
            <Label for="externalBookingId" className="text-dark">
              {t("booking.filters.filterByExternalId")}
            </Label>
            <InputGroup>
              <Input
                id="externalBookingId"
                type="text"
                placeholder={t("booking.filters.externalIdPlaceholder")}
                value={externalBookingIdInput}
                onChange={handleExternalBookingIdChange}
              />
              <Button
                title={t("booking.filters.filter")}
                color="dark"
                type="submit"
                disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </Button>
              <Button
                color="outline-secondary"
                type="button"
                title={t("booking.filters.clear")}
                onClick={onClearExternalBookingIdFilter}
                disabled={loading || !externalBookingIdInput}>
                <FontAwesomeIcon icon={faBroom} />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col lg="auto" xl="auto" className="mb-3">
          <Label for="statusId" className="text-dark">
            {t("booking.filters.filterByStatus")}
          </Label>
          <select
            id="statusId"
            className={classNames("form-select", {
              "bg-success-subtle": paginationData.statusId,
            })}
            disabled={loading}
            value={paginationData.statusId}
            onChange={(e) => {
              const { value } = e.target;
              handleFilterByStatusId(value);
            }}>
            <option
              className={classNames("form-select", {
                "bg-dark-subtle": paginationData.statusId,
              })}
              value="">
              {paginationData.statusId
                ? t("booking.filters.removeFilter")
                : t("booking.filters.select")}
            </option>
            {BOOKING_STATUSES.map((status) => (
              <option
                key={`${status.id}`}
                className={classNames({
                  "bg-success-subtle":
                    Number(paginationData.statusId) === status.id,
                  "bg-white": Number(paginationData.statusId) !== status.id,
                })}
                value={status.id}>
                {t(status.name)}
              </option>
            ))}
          </select>
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={4} xl={3} className="mb-3">
          <Label for="sortColumn" className="text-dark">
            {t("booking.filters.sortBy")}
          </Label>
          <InputGroup>
            <Input
              id="sortColumn"
              type="select"
              value={paginationData.sortColumn}
              className={classNames("form-select", {
                "bg-success-subtle": paginationData.sortColumn,
              })}
              onChange={handleSortcolumnChange}>
              <option
                value=""
                className={classNames({
                  "bg-dark-subtle": !!paginationData.sortColumn,
                })}>
                {t("booking.filters.selectSortOption")}
              </option>
              {Object.keys(BOOKING_VIEW_SORT_OPTIONS).map((option) => {
                const optionName =
                  BOOKING_VIEW_SORT_OPTIONS[
                    option as keyof typeof BOOKING_VIEW_SORT_OPTIONS
                  ];
                return (
                  <option
                    key={option}
                    value={option}
                    className={classNames({
                      "bg-success-subtle": paginationData.sortColumn === option,
                      "bg-white": paginationData.sortColumn !== option,
                    })}>
                    {t(optionName)}
                  </option>
                );
              })}
            </Input>
            <Button
              color="outline-dark"
              type="button"
              title={
                paginationData.sortDirection === "ASC"
                  ? t("booking.filters.ascending")
                  : t("booking.filters.descending")
              }
              onClick={() => toggleSortDirection()}
              disabled={loading || !paginationData.sortColumn}>
              <FontAwesomeIcon
                icon={
                  paginationData.sortDirection === "ASC"
                    ? faArrowUpShortWide
                    : faArrowDownShortWide
                }
              />
            </Button>
          </InputGroup>
        </Col>
        <Col className="mb-3">
          <div className="float-end">
            <Label for="pageSize" className="text-dark">
              {t("booking.filters.rowsPerPage")}
            </Label>
            <select
              id="pageSize"
              className="form-select"
              value={paginationData.pageSize}
              onChange={handlePageSizeChange}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default BookingFiltersV2;
