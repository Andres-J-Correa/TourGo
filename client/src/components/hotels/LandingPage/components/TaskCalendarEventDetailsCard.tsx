import { Card, CardBody, CardHeader } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faUser,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "contexts/LanguageContext";
import dayjs from "dayjs";
import type { Task } from "services/taskService";

export default function TaskCalendarEventDetailsCard({ task }: { task: Task }) {
  const { t } = useLanguage();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="bg-dark border-bottom pt-3 pb-2">
        <h6
          className="mb-0 fw-bold text-white text-truncate"
          title={task.title}>
          {task.title}
        </h6>
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
