import React, { useState } from "react";
import { Button, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCalendarXmark,
  faBell,
  faBellSlash,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { type Task } from "services/taskService";
import { useLanguage } from "contexts/LanguageContext";
import Swal from "sweetalert2";
import classNames from "classnames";

interface TaskCalendarEventProps {
  event: {
    resource: Task;
  };
  title: string;
  onDelete: (id: number) => Promise<void>;
  handleEditClick: (task: Task) => void;
  onToggleReminders: (task: Task) => Promise<void>;
  onToggleCompleted: (task: Task) => Promise<void>;
}

type LoadingAction = "editing" | "deleting" | "completing" | "reminders" | null;

const TaskCalendarEvent: React.FC<TaskCalendarEventProps> = ({
  event,
  title,
  onDelete,
  handleEditClick,
  onToggleReminders,
  onToggleCompleted,
}) => {
  const { t } = useLanguage();
  const { resource: task } = event;
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
    <div className="d-flex flex-column h-100 justify-content-between p-1 task-calendar-event-content">
      <div className="text-truncate fw-bold mb-1" title={title}>
        {title}
      </div>

      <div className="gap-1 justify-content-end task-event-actions d-none d-md-flex">
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
            <FontAwesomeIcon
              icon={!task.isCompleted ? faCheck : faCalendarXmark}
            />
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
  );
};

export default TaskCalendarEvent;
