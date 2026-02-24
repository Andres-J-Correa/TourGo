import React, { useState, useEffect, useMemo } from "react";
import { Row, Col } from "reactstrap";
import { Chart } from "react-google-charts";
import Select from "react-select";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import Alert from "components/commonUI/Alert";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import { getRoomsCollectedVSOccupancy } from "services/financialReportService";
import dayjs from "dayjs";
import { getByHotelId as getRoomsByHotelId } from "services/roomService";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";
import { getDateString } from "utils/dateHelper";

const getMonthRange = () => ({
  start: dayjs().startOf("month").format("YYYY-MM-DD"),
  end: dayjs().endOf("month").format("YYYY-MM-DD"),
});

function RoomOccupancyReport({ hotelId }) {
  const [rooms, setRooms] = useState([]);
  const [dates, setDates] = useState(getMonthRange());
  const [selectedRooms, setSelectedRooms] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const { t } = useLanguage();

  const handleDateChange = (type) => (date) => {
    setDates((prev) => ({
      ...prev,
      [type]: getDateString(date),
    }));
  };

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
      });
    }

    if (inactiveRooms.length > 0) {
      options.push({
        label: t("financialReports.roomOccupancyReport.inactiveRooms"),
        options: inactiveRooms,
      });
    }

    return options;
  }, [rooms, t]);

  const handleRoomChange = (selectedOptions) => {
    setSelectedRooms(selectedOptions);
    setShowPrompt(
      !(
        selectedOptions &&
        selectedOptions.length > 0 &&
        dates.start &&
        dates.end
      ),
    );
    setData(null);
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

  useEffect(() => {
    if (
      hotelId &&
      selectedRooms &&
      selectedRooms.length > 0 &&
      dates.start &&
      dates.end
    ) {
      setLoading(true);
      setShowPrompt(false);

      const roomIds = selectedRooms.map((room) => room.value);

      getRoomsCollectedVSOccupancy(hotelId, dates.start, dates.end, roomIds)
        .then((res) => {
          if (res?.isSuccessful && Array.isArray(res.items)) {
            setData(res.items);
          } else {
            setData(null);
          }
        })
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    } else {
      setShowPrompt(true);
      setData(null);
    }
  }, [hotelId, selectedRooms, dates.start, dates.end]);

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
            options={roomSelectOptions}
            value={selectedRooms}
            onChange={handleRoomChange}
            isDisabled={loading || loadingRooms}
            placeholder={
              loadingRooms
                ? t("common.loading")
                : t("financialReports.roomOccupancyReport.selectRoom")
            }
            isClearable
          />
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
