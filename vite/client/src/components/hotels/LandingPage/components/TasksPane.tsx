import React, { useState, useMemo, useEffect } from "react";
import { Button, Accordion, Row, Col, ButtonGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faList, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { type Task } from "services/taskService";
import TaskModal from "./TaskModal";
import { useLanguage } from "contexts/LanguageContext";
import { useTasks } from "../hooks/useTasks";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import { getDateString } from "utils/dateHelper";
import TaskAccordionItem from "./TaskAccordionItem";
import dayjs from "dayjs";
import {
  Calendar,
  dayjsLocalizer,
  type EventProps,
  type View,
  Views,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import "./TasksPane.css";
import TaskCalendarEvent from "./TaskCalendarEvent";
import Popover from "components/commonUI/popover/Popover";
import TaskCalendarEventDetailsCard from "./TaskCalendarEventDetailsCard";

const localizer = dayjsLocalizer(dayjs);

interface TasksPaneProps {
  hotelId: string | undefined;
  initialDate: string;
}

type ViewMode = "list" | "calendar";

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task;
}

const eventPropGetter = (event: CalendarEvent) => {
  const isLate = dayjs(event.resource.dueDate).isBefore(dayjs());
  let className = "";
  if (event.resource.isCompleted)
    className = "bg-success text-white text-decoration-line-through opacity-75";
  else if (isLate) className = "bg-danger text-white";
  else className = "bg-dark text-white";

  return { className };
};

const TasksPane: React.FC<TasksPaneProps> = ({ hotelId, initialDate }) => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<string | null>(
    dayjs(initialDate).startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string | null>(
    dayjs(initialDate).endOf("month").format("YYYY-MM-DD")
  );

  const {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleReminders,
    deleteTask,
    staff,
    loadingStaff,
    toggleCompleted,
  } = useTasks(hotelId, startDate, endDate);

  const [modalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  // List view state
  const [openAccordion, setOpenAccordion] = useState<string>("");
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  // Calendar view state
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(initialDate));

  // Map tasks to calendar events
  const events = useMemo<CalendarEvent[]>(
    () =>
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        allDay: true,
        resource: task,
      })),
    [tasks]
  );

  const calendarMessages = useMemo(() => {
    return {
      showMore: (total: number) => `+${total} ${t("tasks.calendar.more")}`,
      previous: t("tasks.calendar.previous"),
      next: t("tasks.calendar.next"),
      today: t("tasks.calendar.today"),
      month: t("tasks.calendar.month"),
      week: t("tasks.calendar.week"),
      work_week: t("tasks.calendar.workWeek"),
      day: t("tasks.calendar.day"),
      agenda: t("tasks.calendar.agenda"),
      list: t("tasks.calendar.list"),
      date: t("tasks.calendar.date"),
      time: t("tasks.calendar.time"),
      event: t("tasks.calendar.event"),
      allDay: t("tasks.calendar.allDay"),
      noEventsInRange: t("tasks.calendar.noEventsInRange"),
    };
  }, [t]);

  const toggleAccordion = (id: string) => {
    if (openAccordion === id) {
      setOpenAccordion("");
    } else {
      setOpenAccordion(id);
    }
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) setTaskToEdit(null); // Clear edit state on close
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setModalOpen(true);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(getDateString(date));
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(getDateString(date));
  };

  const handleCalendarNavigate = (date: Date) => {
    setCalendarDate(date);
    const start = dayjs(date).startOf("month").format("YYYY-MM-DD");
    const end = dayjs(date).endOf("month").format("YYYY-MM-DD");
    setStartDate(start);
    setEndDate(end);
  };

  const handleCalendarViewChange = (view: View) => {
    setCalendarView(view);
  };

  useEffect(() => {
    if (viewMode === "calendar") {
      setStartDate((prev) => dayjs(prev).startOf("month").format("YYYY-MM-DD"));
      setEndDate((prev) => dayjs(prev).endOf("month").format("YYYY-MM-DD"));
    }
  }, [viewMode]);

  return (
    <div>
      <div className="mb-3">
        <Row className="align-items-center g-2">
          {viewMode === "list" && (
            <Col xs={12} md={6} lg={4}>
              <DatePickersV2
                startDate={startDate}
                endDate={endDate}
                handleStartChange={handleStartDateChange}
                handleEndChange={handleEndDateChange}
                allowSameDay={true}
              />
            </Col>
          )}

          <Col className="d-flex justify-content-end gap-2 ms-auto">
            <ButtonGroup>
              <Button
                color={viewMode === "calendar" ? "dark" : "outline-dark"}
                onClick={() => setViewMode("calendar")}
                active={viewMode === "calendar"}>
                <FontAwesomeIcon icon={faCalendar} />
              </Button>
              <Button
                color={viewMode === "list" ? "dark" : "outline-dark"}
                onClick={() => setViewMode("list")}
                active={viewMode === "list"}>
                <FontAwesomeIcon icon={faList} />
              </Button>
            </ButtonGroup>

            <Button
              color="dark"
              onClick={() => {
                setTaskToEdit(null);
                toggleModal();
              }}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              {t("tasks.addTask")}
            </Button>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center py-4">{t("tasks.loading")}</div>
      ) : (
        <>
          {viewMode === "list" ? (
            tasks.length === 0 ? (
              <div className="text-center py-4 text-muted">
                {t("tasks.noTasks")}
              </div>
            ) : (
              <div className="tasks-accordion">
                <Accordion open={openAccordion} toggle={toggleAccordion}>
                  {tasks.map((task) => (
                    <TaskAccordionItem
                      key={task.id}
                      task={task}
                      toggleReminders={toggleReminders}
                      toggleCompleted={toggleCompleted}
                      deleteTask={deleteTask}
                      handleEditClick={handleEditClick}
                    />
                  ))}
                </Accordion>
              </div>
            )
          ) : (
            <div
              style={{ height: "600px" }}
              className="mt-3 tasks-calendar-wrapper">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                view={calendarView}
                onView={handleCalendarViewChange}
                date={calendarDate}
                onNavigate={handleCalendarNavigate}
                selectable
                popup
                messages={calendarMessages}
                views={["month"]}
                components={{
                  event: (props: EventProps<CalendarEvent>) => (
                    <Popover
                      action="click"
                      content={
                        <TaskCalendarEventDetailsCard
                          task={props.event.resource}
                          onDelete={deleteTask}
                          handleEditClick={handleEditClick}
                          onToggleReminders={toggleReminders}
                          onToggleCompleted={toggleCompleted}
                        />
                      }>
                      <div>
                        <TaskCalendarEvent
                          {...props}
                          onDelete={deleteTask}
                          handleEditClick={handleEditClick}
                          onToggleReminders={toggleReminders}
                          onToggleCompleted={toggleCompleted}
                        />
                      </div>
                    </Popover>
                  ),
                }}
                eventPropGetter={eventPropGetter}
              />
            </div>
          )}
        </>
      )}

      <TaskModal
        isOpen={modalOpen}
        toggle={toggleModal}
        staff={staff}
        loadingStaff={loadingStaff}
        onSave={async (task) => {
          if ("id" in task) {
            return await updateTask(task);
          } else {
            return await addTask(task);
          }
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default TasksPane;
