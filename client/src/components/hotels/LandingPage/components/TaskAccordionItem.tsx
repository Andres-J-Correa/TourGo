import { useState } from "react";
import {
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  Col,
  Row,
  Button,
  Spinner,
} from "reactstrap";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHourglassEnd,
  faUserCheck,
  faEdit,
  faTrash,
  faBell,
  faBellSlash,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "contexts/LanguageContext";
import type { Task } from "services/taskService";

interface TaskAccordionItemProps {
  task: Task;
  onDelete: (id: number) => Promise<void>;
  handleEditClick: (task: Task) => void;
  toggleReminders: (task: Task) => Promise<void>;
  toggleCompleted: (task: Task) => Promise<void>;
}

export default function TaskAccordionItem({
  task,
  onDelete,
  handleEditClick,
  toggleReminders,
  toggleCompleted,
}: TaskAccordionItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDeleteClick = async (id: number) => {
    if (isUpdating) return;
    setIsUpdating(true);
    await onDelete(id);
    setIsUpdating(false);
  };

  const handleToggleReminders = async (task: Task) => {
    if (isUpdating) return;
    setIsUpdating(true);
    await toggleReminders(task);
    setIsUpdating(false);
  };

  const handleToggleCompleted = async (task: Task) => {
    if (isUpdating) return;
    setIsUpdating(true);
    await toggleCompleted(task);
    setIsUpdating(false);
  };

  const { t } = useLanguage();
  const isLate = dayjs(task.dueDate).isBefore(dayjs()) && !task.isCompleted;
  const badgeContent = task.isCompleted
    ? t("tasks.completed")
    : dayjs(task.dueDate).local().format("MMM D - h:mm a");
  return (
    <AccordionItem key={task.id}>
      <AccordionHeader targetId={task.id.toString()}>
        <div className="w-90">
          <Row>
            <Col xs={12} className="mb-2 text-truncate">
              <span className="fw-bold text-dark">{task.title}</span>
            </Col>
            <Col xs={12} md={6} className="mb-2">
              <span
                className={`badge me-2 ${isLate ? "bg-danger" : "bg-success"}`}>
                {badgeContent}
                {isLate && (
                  <FontAwesomeIcon icon={faHourglassEnd} className="ms-2" />
                )}
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
        <h6 className="d-md-none">{task.title}</h6>
        <div className="mb-3">
          <strong>{t("tasks.form.description")}:</strong>
          <p className="mb-0 text-break">
            {task.description || t("tasks.noDescription")}
          </p>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          {!task.isCompleted && (
            <Button
              color="dark"
              size="sm"
              onClick={() => handleEditClick(task)}
              title={t("tasks.actions.edit")}>
              <FontAwesomeIcon icon={faEdit} className="me-1" />
              {t("tasks.actions.edit")}
            </Button>
          )}
          {!task.isCompleted && (
            <Button
              color={task.remindersEnabled ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleToggleReminders(task)}
              title={
                task.remindersEnabled
                  ? t("tasks.actions.deactivateReminders")
                  : t("tasks.actions.activateReminders")
              }
              disabled={isUpdating}>
              {isUpdating ? (
                <Spinner size="sm" />
              ) : (
                <FontAwesomeIcon
                  icon={task.remindersEnabled ? faBell : faBellSlash}
                />
              )}
            </Button>
          )}
          <Button
            color={!task.isCompleted ? "outline-success" : "dark"}
            size="sm"
            onClick={() => handleToggleCompleted(task)}
            title={
              task.isCompleted
                ? t("tasks.actions.markIncomplete")
                : t("tasks.actions.markComplete")
            }
            disabled={isUpdating}>
            {isUpdating ? (
              <Spinner size="sm" />
            ) : (
              <FontAwesomeIcon icon={!task.isCompleted ? faCheck : faTimes} />
            )}
          </Button>
          <Button
            outline
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(task.id)}
            title={t("tasks.actions.delete")}
            disabled={isUpdating}>
            {isUpdating ? (
              <Spinner size="sm" />
            ) : (
              <FontAwesomeIcon icon={faTrash} />
            )}
          </Button>
        </div>
      </AccordionBody>
    </AccordionItem>
  );
}
