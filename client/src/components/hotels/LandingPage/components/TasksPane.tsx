import React, { useState } from "react";
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
import {
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import TaskModal from "./TaskModal";
import Swal from "sweetalert2";
import dayjs from "dayjs";

interface TasksPaneProps {
  tasks: Task[];
  loading: boolean;
  onAddTask: (task: TaskAddRequest) => Promise<boolean | void>;
  onUpdateTask: (task: TaskUpdateRequest) => Promise<boolean | void>;
  onToggleReminders: (task: Task) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
}

const TasksPane: React.FC<TasksPaneProps> = ({
  tasks,
  loading,
  onAddTask,
  onUpdateTask,
  onToggleReminders,
  onDeleteTask,
}) => {
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
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await onDeleteTask(id);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <Button color="dark" onClick={toggleModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-4 text-muted">
          No tasks found for this date.
        </div>
      ) : (
        <div className="tasks-accordion">
          {/* Note: In Reactstrap 9, Accordion uses 'open' prop (string | string[]) and 'toggle' function */}
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
                              : "bg-info"
                          } me-2`}>
                          {dayjs(task.dueDate).format("MMM D - h:mm a")}
                        </span>
                      </Col>
                      <Col xs={12} md={6} className="text-md-end">
                        <FontAwesomeIcon icon={faUserCheck} className="me-2" />
                        <small className="me-4">
                          {task.assignedUser
                            ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                            : "Unassigned"}
                        </small>
                      </Col>
                    </Row>
                  </div>
                </AccordionHeader>
                <AccordionBody accordionId={task.id.toString()}>
                  <h6>{task.title}</h6>
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="mb-0 text-break">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      color="dark"
                      size="sm"
                      onClick={() => handleEditClick(task)}
                      title="Edit">
                      <FontAwesomeIcon icon={faEdit} className="me-1" />
                      Edit
                    </Button>
                    <Button
                      color={task.remindersEnabled ? "success" : "secondary"}
                      size="sm"
                      onClick={() => onToggleReminders(task)}
                      title="Toggle Reminders">
                      <FontAwesomeIcon
                        icon={task.remindersEnabled ? faBell : faBellSlash}
                      />
                    </Button>
                    <Button
                      outline
                      color="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(task.id)}
                      title="Delete">
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
        onSave={async (task) => {
          if ("id" in task) {
            await onUpdateTask(task);
          } else {
            await onAddTask(task);
          }
          toggleModal();
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default TasksPane;
