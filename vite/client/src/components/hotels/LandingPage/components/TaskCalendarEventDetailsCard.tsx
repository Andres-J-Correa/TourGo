import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faUser,
  faClock,
  faCheck,
  faTimes,
  faBell,
  faBellSlash,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "contexts/LanguageContext";
import dayjs from "dayjs";
import type { Task } from "services/taskService";
import Swal from "sweetalert2";
import classNames from "classnames";

interface TaskCalendarEventDetailsCardProps {
  task: Task;
  onDelete: (id: number) => Promise<void>;
  handleEditClick: (task: Task) => void;
  onToggleReminders: (task: Task) => Promise<void>;
  onToggleCompleted: (task: Task) => Promise<void>;
}

type LoadingAction = "editing" | "deleting" | "completing" | "reminders" | null;

export default function TaskCalendarEventDetailsCard({
  task,
  onDelete,
  handleEditClick,
  onToggleReminders,
  onToggleCompleted,
}: TaskCalendarEventDetailsCardProps) {
  const { t } = useLanguage();
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingAction) return;

    const result = await Swal.fire({
      title: t("tasks.actions.deleteConfirmTitle"),
      text: t("tasks.actions.deleteConfirmText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("tasks.actions.deleteConfirmYes"),
      cancelButtonText: t("tasks.form.cancel"),
    });

    if (result.isConfirmed) {
      setLoadingAction("deleting");
      try {
        await onDelete(task.id);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleToggleReminders = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingAction) return;
    setLoadingAction("reminders");
    try {
      await onToggleReminders(task);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleCompleted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loadingAction) return;
    setLoadingAction("completing");
    try {
      await onToggleCompleted(task);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-dark border-bottom pt-3 pb-2">
        <div className="d-flex justify-content-between align-items-start">
          <h6
            className="mb-0 fw-bold text-white text-truncate me-2"
            title={task.title}
            style={{ flex: 1 }}>
            {task.title}
          </h6>

          <div className="d-flex gap-1 d-md-none">
            {!task.isCompleted && (
              <Button
                color="light"
                size="sm"
                className={`p-0 px-1 border-0 bg-transparent text-white`}
                onClick={() => handleEditClick(task)}
                title={t("tasks.actions.edit")}
                disabled={loadingAction !== null}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            )}

            {!task.isCompleted && (
              <Button
                color="light"
                size="sm"
                className={classNames("p-0 px-1 border-0 bg-transparent", {
                  "text-white-50": !task.remindersEnabled,
                  "text-white": task.remindersEnabled,
                })}
                onClick={handleToggleReminders}
                title={
                  task.remindersEnabled
                    ? t("tasks.actions.deactivateReminders")
                    : t("tasks.actions.activateReminders")
                }
                disabled={loadingAction !== null}>
                {loadingAction === "reminders" ? (
                  <Spinner size="sm" />
                ) : (
                  <FontAwesomeIcon
                    icon={task.remindersEnabled ? faBell : faBellSlash}
                  />
                )}
              </Button>
            )}

            <Button
              color="light"
              size="sm"
              className="p-0 px-1 border-0 bg-transparent text-white"
              onClick={handleToggleCompleted}
              title={
                task.isCompleted
                  ? t("tasks.actions.markIncomplete")
                  : t("tasks.actions.markComplete")
              }
              disabled={loadingAction !== null}>
              {loadingAction === "completing" ? (
                <Spinner size="sm" />
              ) : (
                <FontAwesomeIcon icon={!task.isCompleted ? faCheck : faTimes} />
              )}
            </Button>

            <Button
              color="light"
              size="sm"
              className="p-0 px-1 border-0 bg-transparent text-white"
              onClick={handleDeleteClick}
              title={t("tasks.actions.delete")}
              disabled={loadingAction !== null}>
              {loadingAction === "deleting" ? (
                <Spinner size="sm" />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-3">
        {/* Description */}
        <div className="d-flex mb-3">
          <div className="me-3 text-muted">
            <FontAwesomeIcon icon={faAlignLeft} fixedWidth />
          </div>
          <div className="text-secondary small">
            {task.description || (
              <span className="fst-italic text-muted">
                {t("tasks.noDescription")}
              </span>
            )}
          </div>
        </div>

        {/* Assignee */}
        <div className="d-flex mb-3 align-items-center">
          <div className="me-3 text-muted">
            <FontAwesomeIcon icon={faUser} fixedWidth />
          </div>
          <div>
            {task.assignedUser ? (
              <span className="fw-semibold text-dark small">
                {task.assignedUser.firstName} {task.assignedUser.lastName}
              </span>
            ) : (
              <span className="text-muted small">
                {t("tasks.form.unassigned")}
              </span>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="d-flex align-items-center">
          <div className="me-3 text-muted">
            <FontAwesomeIcon icon={faClock} fixedWidth />
          </div>
          <div className="small">
            <span
              className={
                dayjs(task.dueDate).isBefore(dayjs(), "day") &&
                !task.isCompleted
                  ? "text-danger fw-bold"
                  : "text-dark"
              }>
              {dayjs(task.dueDate).format("MMM D, YYYY h:mm A")}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
