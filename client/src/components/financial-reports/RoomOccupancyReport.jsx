import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Button } from "reactstrap";
import { Chart } from "react-google-charts";
import Select, { components } from "react-select";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getRoomsCollectedVSOccupancy } from "services/financialReportService";
import dayjs from "dayjs";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import isEqual from "lodash.isequal";
import classNames from "classnames";
import { useNumericFormat } from "react-number-format";

import "./RoomOccupancyReport.css";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function RoomOccupancyReport({ hotelId }) {
  const [rooms, setRooms] = useState([]);
  const [dates, setDates] = useState(getMonthRange());
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({
    dates: getMonthRange(),
    selectedRooms: [],
  });

  const totalsAverage = useMemo(() => {
    const initial = { occupancyRate: 0, collectedAmount: 0 };

    if (!Array.isArray(data) || data.length === 0) {
      return initial;
    }

    const totals = data.reduce(
      (acc, { occupancyRate = 0, collectedAmount = 0 }) => ({
        occupancyRate: acc.occupancyRate + occupancyRate,
        collectedAmount: acc.collectedAmount + collectedAmount,
      }),
      initial,
    );

    return {
      occupancyRate: totals.occupancyRate / data.length,
      collectedAmount: totals.collectedAmount / data.length,
    };
  }, [data]);

  const { t } = useLanguage();

  const { format } = useNumericFormat({
    thousandSeparator: ".",
    decimalSeparator: ",",
  });

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: getDateString(date),
    }));
  };

  const isSearchDisabled = useMemo(
    () => !hotelId || !dates.start || !dates.end,
    [dates, hotelId],
  );

  const haveFiltersChanged = useMemo(
    () => !isEqual({ dates, selectedRooms }, appliedFilters),
    [dates, selectedRooms, appliedFilters],
  );

  const roomSelectOptions = useMemo(() => {
    const activeRooms = [];
    const inactiveRooms = [];

    rooms.forEach((room) => {
      const option = {
        value: room.id,
        label: room.name,
      };

      if (room.isActive) {
        activeRooms.push(option);
      } else {
        inactiveRooms.push(option);
      }
    });

    const options = [];

    if (activeRooms.length > 0) {
      options.push({
        label: t("financialReports.roomOccupancyReport.activeRooms"),
        options: activeRooms,
        id: "active-rooms",
      });
    }

    if (inactiveRooms.length > 0) {
      options.push({
        label: t("financialReports.roomOccupancyReport.inactiveRooms"),
        options: inactiveRooms,
        id: "inactive-rooms",
      });
    }

    return { options, activeRooms, inactiveRooms };
  }, [rooms, t]);

  const handleRoomChange = (selectedOptions) => {
    setSelectedRooms(selectedOptions);
  };

  const handleSearch = async () => {
    if (isSearchDisabled || selectedRooms?.length === 0) {
      setShowPrompt(true);
      setData(null);
      setAppliedFilters((prev) => ({ ...prev, selectedRooms: [] }));
      return;
    }

    try {
      setLoading(true);
      setShowPrompt(false);
      setAppliedFilters({
        dates: { ...dates },
        selectedRooms: [...selectedRooms],
      });

      const roomIds = selectedRooms.map((room) => room.value);

      const res = await getRoomsCollectedVSOccupancy(
        hotelId,
        dates.start,
        dates.end,
        roomIds,
      );

      if (res?.isSuccessful && Array.isArray(res.items)) {
        setData(res.items);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const rows = data.map((room) => [
      room.roomName,
      {
        v: room.collectedAmount,
        f: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(room.collectedAmount),
      },
      {
        v: room.occupancyRate,
        f: `${(room.occupancyRate * 100).toFixed(0)}%`,
      },
    ]);

    return [
      [
        t("financialReports.roomOccupancyReport.roomLabel"),
        t("financialReports.roomOccupancyReport.revenue"),
        t("financialReports.roomOccupancyReport.occupancy"),
      ],
      ...rows,
    ];
  }, [data, t]);

  const chartOptions = {
    title: t("financialReports.roomOccupancyReport.chartTitle"),
    vAxes: {
      0: {
        title: t("financialReports.roomOccupancyReport.revenue"),
        format: "currency",
      },
      1: {
        title: t("financialReports.roomOccupancyReport.occupancy"),
        format: "#%",
        minValue: 0,
        maxValue: 1,
      },
    },
    hAxis: {
      title: t("financialReports.roomOccupancyReport.roomLabel"),
    },
    seriesType: "bars",
    series: {
      1: {
        type: "line",
        targetAxisIndex: 1,
      },
    },
    animation: { duration: 1000, easing: "out" },
  };

  const onGroupHeadingClick = (e) => {
    const headingId = e.currentTarget.id;

    const toCompare =
      headingId === "active-rooms"
        ? roomSelectOptions.activeRooms
        : roomSelectOptions.inactiveRooms;

    const toSelect = toCompare.filter(
      (option) =>
        !selectedRooms?.some((selected) => selected.value === option.value),
    );

    const newSelected = [...(selectedRooms || []), ...toSelect];
    setSelectedRooms(newSelected);
  };

  const GroupHeading = (props) => (
    <components.GroupHeading {...props}>
      <div
        id={props?.data?.id}
        className="cursor-pointer room-occupancy-report-group-header"
        onClick={onGroupHeadingClick}>
        <span>{props.children}</span>
      </div>
    </components.GroupHeading>
  );

  useEffect(() => {
    if (!hotelId) return;
    setLoadingRooms(true);
    getRoomsByHotelId(hotelId)
      .then((res) => {
        if (res.isSuccessful) {
          setRooms(res.items);
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error(t("financialReports.roomOccupancyReport.loadRoomsError"));
        }
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  }, [hotelId, t]);

  return (
    <div>
      <h4>{t("financialReports.roomOccupancyReport.title")}</h4>
      <p>{t("financialReports.roomOccupancyReport.description")}</p>
      <Row>
        <Col xs={12}>
          <DatePickersV2
            startDate={dates.start}
            endDate={dates.end}
            handleStartChange={handleDateChange("start")}
            handleEndChange={handleDateChange("end")}
            disabled={loading}
            allowSameDay={true}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <label className="form-label">
            {t("financialReports.roomOccupancyReport.roomLabel")}
          </label>
          <Select
            isMulti
            options={roomSelectOptions.options}
            value={selectedRooms}
            onChange={handleRoomChange}
            closeMenuOnSelect={false}
            isDisabled={loading || loadingRooms}
            placeholder={
              loadingRooms
                ? t("common.loading")
                : t("financialReports.roomOccupancyReport.selectRoom")
            }
            isClearable
            styles={{
              menu: (provided) => ({ ...provided, zIndex: 4 }),
            }}
            components={{ GroupHeading }}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button
            color="dark"
            type="submit"
            disabled={isSearchDisabled || loading || !haveFiltersChanged}
            className={classNames({
              "filter-btn-glow": haveFiltersChanged && !isSearchDisabled,
            })}
            onClick={handleSearch}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={classNames("me-2", {
                "fa-bounce": haveFiltersChanged && !isSearchDisabled,
              })}
            />
            {t("common.search")}
          </Button>
        </Col>
      </Row>

      <SimpleLoader isVisible={loading} />
      {showPrompt && (
        <Alert
          type="info"
          message={
            !dates.start || !dates.end
              ? t("financialReports.roomOccupancyReport.selectDatesPrompt")
              : t("financialReports.roomOccupancyReport.selectRoomPrompt")
          }
        />
      )}
      {!showPrompt && !loading && data === null && (
        <Alert
          type="info"
          message={t("financialReports.roomOccupancyReport.noData")}
        />
      )}
      {!showPrompt && !loading && chartData && (
        <div className="d-flex flex-column align-items-center w-100">
          <h6>
            {t("financialReports.roomOccupancyReport.avgRevenue")} ${" "}
            {format(String(totalsAverage.collectedAmount.toFixed(2)))}
          </h6>
          <h6>
            {t("financialReports.roomOccupancyReport.avgOccupancyRate")}{" "}
            {Number(totalsAverage.occupancyRate * 100).toFixed(2)}%
          </h6>
          <Chart
            chartType="ComboChart"
            width="100%"
            height="400px"
            data={chartData}
            options={chartOptions}
            className="mb-3"
          />
        </div>
      )}
    </div>
  );
}

export default RoomOccupancyReport;
