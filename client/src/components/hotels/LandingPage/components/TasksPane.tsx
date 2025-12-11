import React, { useMemo, useState } from "react";
import {
  Button,
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Row,
  Col,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faBell,
  faBellSlash,
  faPlus,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import { type Task } from "services/taskService";
import TaskModal from "./TaskModal";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { useLanguage } from "contexts/LanguageContext";
import { useTasks } from "../hooks/useTasks";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import { getDateString } from "utils/dateHelper";

interface TasksPaneProps {
  hotelId: string | undefined;
  initialDate: string;
}

const TasksPane: React.FC<TasksPaneProps> = ({ hotelId, initialDate }) => {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<string | null>(initialDate);
  const [endDate, setEndDate] = useState<string | null>(initialDate); // Initially same day

  const {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleReminders,
    deleteTask,
    staff,
    loadingStaff,
  } = useTasks(hotelId, startDate, endDate);

  const [modalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string>("");

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

  const handleDeleteClick = async (id: number) => {
    const result = await Swal.fire({
      title: t("tasks.actions.deleteConfirmTitle"),
      text: t("tasks.actions.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("tasks.actions.deleteConfirmYes"),
      cancelButtonText: t("tasks.form.cancel"),
    });

    if (result.isConfirmed) {
      await deleteTask(id);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(getDateString(date));
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(getDateString(date));
  };

  return (
    <div>
      <div className="mb-3">
        <Row>
          <Col xs={12} md={8}>
            <DatePickersV2
              startDate={startDate}
              endDate={endDate}
              handleStartChange={handleStartDateChange}
              handleEndChange={handleEndDateChange}
              allowSameDay={true}
            />
          </Col>
          <Col className="text-end align-content-center">
            <Button color="dark" onClick={toggleModal}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              {t("tasks.addTask")}
            </Button>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center py-4">{t("tasks.loading")}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-4 text-muted">{t("tasks.noTasks")}</div>
      ) : (
        <div className="tasks-accordion">
          <Accordion open={openAccordion} toggle={toggleAccordion}>
            {tasks.map((task) => (
              <AccordionItem key={task.id}>
                <AccordionHeader targetId={task.id.toString()}>
                  <div className="w-90">
                    <Row>
                      <Col xs={12} className="mb-2 text-truncate">
                        <span className="fw-bold text-dark">{task.title}</span>
                      </Col>
                      <Col xs={12} md={6} className="mb-2">
                        <span
                          className={`badge ${
                            dayjs(task.dueDate).isBefore(dayjs())
                              ? "bg-danger"
                              : "bg-success"
                          } me-2`}>
                          {dayjs(task.dueDate).format("MMM D - h:mm a")}
                        </span>
                      </Col>
                      <Col xs={12} md={6} className="text-md-end">
                        <FontAwesomeIcon icon={faUserCheck} className="me-2" />
                        <small className="me-4">
                          {task.assignedUser
                            ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                            : t("tasks.form.unassigned")}
                        </small>
                      </Col>
                    </Row>
                  </div>
                </AccordionHeader>
                <AccordionBody accordionId={task.id.toString()}>
                  <h6>{task.title}</h6>
                  <div className="mb-3">
                    <strong>{t("tasks.form.description")}:</strong>
                    <p className="mb-0 text-break">
                      {task.description ||
                        t("tasks.form.descriptionPlaceholder")}{" "}
                    </p>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      color="dark"
                      size="sm"
                      onClick={() => handleEditClick(task)}
                      title={t("tasks.actions.edit")}>
                      <FontAwesomeIcon icon={faEdit} className="me-1" />
                      {t("tasks.actions.edit")}
                    </Button>
                    <Button
                      color={task.remindersEnabled ? "success" : "secondary"}
                      size="sm"
                      onClick={() => toggleReminders(task)}
                      title={t("tasks.actions.toggleReminders")}>
                      <FontAwesomeIcon
                        icon={task.remindersEnabled ? faBell : faBellSlash}
                      />
                    </Button>
                    <Button
                      outline
                      color="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(task.id)}
                      title={t("tasks.actions.delete")}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </AccordionBody>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <TaskModal
        isOpen={modalOpen}
        toggle={toggleModal}
        staff={staff}
        loadingStaff={loadingStaff}
        onSave={async (task) => {
          if ("id" in task) {
            await updateTask(task);
          } else {
            await addTask(task);
          }
          toggleModal();
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default TasksPane;
