import { useEffect, useState } from "react";
import { useSignalR } from "contexts/SignalRContext";
import TaskRemindersModal, { type TaskReminder } from "./TaskRemindersModal";
import useSound from "use-sound";

const notificationSound = require("assets/sounds/task-reminder-notification.mp3");

type TaskReminderPayload = TaskReminder[];

export default function TaskRemindersListener() {
  const { connection } = useSignalR("taskReminders");
  const [modalOpen, setModalOpen] = useState(false);
  const [reminders, setReminders] = useState<TaskReminder[]>([]);
  const [play] = useSound(notificationSound);

  const toggleModal = () => setModalOpen(!modalOpen);

  useEffect(() => {
    if (!connection) return;

    const handleReceive = (data: TaskReminderPayload) => {
      if (data && data.length > 0) {
        setReminders(data);
        setModalOpen(true);
        play();
      }
    };

    // Attach listener
    connection.on("ReceiveTaskReminders", handleReceive);

    // Cleanup
    return () => {
      connection.off("ReceiveTaskReminders", handleReceive);
    };
  }, [connection, play]);

  return (
    <>
      {modalOpen && (
        <TaskRemindersModal
          isOpen={modalOpen}
          toggle={toggleModal}
          tasks={reminders}
        />
      )}
    </>
  );
}
