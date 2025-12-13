import { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  Spinner,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCalendarAlt,
  faCheck,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { updateCompleted } from "services/taskService";
import { useLanguage } from "contexts/LanguageContext";
import { toast } from "react-toastify";

import "./TaskRemindersModal.css";

export interface TaskReminder {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  assigneeId: string;
  hotelId: string;
  hotelName: string;
}

interface TaskRemindersModalProps {
  isOpen: boolean;
  toggle: () => void;
  tasks: TaskReminder[];
}

export default function TaskRemindersModal({
  isOpen,
  toggle,
  tasks,
}: TaskRemindersModalProps) {
  const { t } = useLanguage();
  const [openAccordion, setOpenAccordion] = useState<string>("");
  const [tasksCopy, setTasksCopy] = useState<TaskReminder[]>(tasks);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const toggleAccordion = (id: string) => {
    if (openAccordion === id) {
      setOpenAccordion("");
    } else {
      setOpenAccordion(id);
    }
  };

  const handleMarkAsCompleted = async (task: TaskReminder) => {
    setLoadingIds((prev) => [...prev, task.id]);
    try {
      const response = await updateCompleted(task.hotelId, task.id, true);
      if (response.isSuccessful) {
        toast.success(t("tasks.notifications.updateSuccess"));

        setTasksCopy((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error(t("tasks.notifications.updateError"));
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== task.id));
    }
  };

  const onGotoHotelClicked = (task: TaskReminder) => {
    toggle();
    navigate(`/hotels/${task.hotelId}`);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-danger">
        <span className="text-white">{t("tasks.reminders.title")}</span>
      </ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">{t("tasks.reminders.subtitle")}</p>
        <Accordion open={openAccordion} toggle={toggleAccordion}>
          {tasksCopy.map((task) => (
            <AccordionItem key={task.id}>
              <AccordionHeader targetId={task.id.toString()}>
                <div className="d-flex flex-column flex-md-row justify-content-between w-100 pe-3">
                  <div
                    className="fw-bold text-truncate me-2"
                    style={{ maxWidth: "300px" }}>
                    {task.title}
                  </div>
                  <div className="small text-muted d-flex align-items-center mt-1 mt-md-0">
                    <span className="me-3">
                      <FontAwesomeIcon icon={faBuilding} className="me-1" />
                      {task.hotelName}
                    </span>
                    <span className="text-danger">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                      {dayjs(task.dueDate).format("MMM D, h:mm A")}
                    </span>
                  </div>
                </div>
              </AccordionHeader>
              <AccordionBody accordionId={task.id.toString()}>
                <div className="mb-3">
                  <strong>{t("tasks.form.description")}:</strong>
                  <p className="mb-0 text-break">
                    {task.description || t("tasks.noDescription")}
                  </p>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    color="dark"
                    size="sm"
                    onClick={() => onGotoHotelClicked(task)}>
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="me-1"
                    />
                    {t("tasks.actions.goToHotel")}
                  </Button>
                  <Button
                    color="success"
                    size="sm"
                    title={t("tasks.actions.markComplete")}
                    onClick={() => handleMarkAsCompleted(task)}
                    disabled={loadingIds.includes(task.id)}>
                    {loadingIds.includes(task.id) ? (
                      <Spinner size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                  </Button>
                </div>
              </AccordionBody>
            </AccordionItem>
          ))}
        </Accordion>
      </ModalBody>
    </Modal>
  );
}
