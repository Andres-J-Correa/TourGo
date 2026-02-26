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
  faArrowDownWideShort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import Select from "react-select";

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
    e: React.ChangeEvent<HTMLInputElement>,
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
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();
    if (!bookingIdInput) return;
    handleFilterByBookingId(bookingIdInput);
  };

  const handleCustomerNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
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
    e: React.ChangeEvent<HTMLInputElement>,
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
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();
    const { firstName, lastName } = customerNameInputs;
    if (!firstName && !lastName) return;
    handleFilterByCustomerName(customerNameInputs);
  };

  const handleExternalBookingIdFilterSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();
    if (!externalBookingIdInput) return;
    handleFilterByExternalBookingId(externalBookingIdInput);
  };

  const handlePageSizeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const { value }: { value: string } = e.target;
    const newPageSize: number = Number(value);
    if (isNaN(newPageSize) || newPageSize <= 0) return;
    onPageSizeChange(newPageSize);
  };

  const statusOptions = BOOKING_STATUSES.map((status) => ({
    value: status.id.toString(),
    label: t(status.name),
  }));

  const handleStatusChange = (
    selectedOption: { value: string; label: string } | null,
  ) => {
    if (selectedOption) {
      handleFilterByStatusId(selectedOption.value);
    } else {
      handleFilterByStatusId("");
    }
  };

  const selectedStatusOption = paginationData.statusId
    ? statusOptions.find(
        (opt) => opt.value === paginationData.statusId?.toString(),
      ) || null
    : null;

  const handleSortcolumnChange = (
    selectedOption: { value: string; label: string } | null,
  ) => {
    if (selectedOption) {
      onSortColumnChange(
        selectedOption.value as keyof typeof BOOKING_VIEW_SORT_OPTIONS,
      );
    } else {
      onSortColumnChange(
        "" as unknown as keyof typeof BOOKING_VIEW_SORT_OPTIONS,
      );
    }
  };

  const sortOptions = Object.keys(BOOKING_VIEW_SORT_OPTIONS).map((option) => ({
    value: option,
    label: t(
      BOOKING_VIEW_SORT_OPTIONS[
        option as keyof typeof BOOKING_VIEW_SORT_OPTIONS
      ],
    ),
  }));

  const selectedSortOption = paginationData.sortColumn
    ? sortOptions.find((opt) => opt.value === paginationData.sortColumn) || null
    : null;

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
          <div style={{ minWidth: "180px" }}>
            <Select
              id="statusId"
              options={statusOptions}
              value={selectedStatusOption}
              onChange={handleStatusChange}
              isDisabled={loading}
              placeholder={t("booking.filters.select")}
              isClearable
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 3 }),
              }}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={4} xl={3} className="mb-3">
          <Label for="sortColumn" className="text-dark">
            {t("booking.filters.sortBy")}
          </Label>
          <InputGroup>
            <div className="flex-grow-1">
              <Select
                id="sortColumn"
                options={sortOptions}
                value={selectedSortOption}
                onChange={handleSortcolumnChange}
                isDisabled={loading}
                placeholder={t("booking.filters.selectSortOption")}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    height: "100%",
                    minHeight: "38px",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 3 }),
                }}
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
              />
            </div>
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
                    : faArrowDownWideShort
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
