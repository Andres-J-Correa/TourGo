import React, { useState } from "react";
import { Button, Accordion, Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { type Task } from "services/taskService";
import TaskModal from "./TaskModal";
import { useLanguage } from "contexts/LanguageContext";
import { useTasks } from "../hooks/useTasks";
import DatePickersV2 from "components/commonUI/forms/DatePickersV2";
import { getDateString } from "utils/dateHelper";
import TaskAccordionItem from "./TaskAccordionItem";

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
    toggleCompleted,
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
