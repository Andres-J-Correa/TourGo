import React, { useState } from "react";
import { Table, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faBell,
  faBellSlash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import TaskModal from "./TaskModal";
import Swal from "sweetalert2";

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
        <Button color="primary" onClick={toggleModal}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-4 text-muted">
          No tasks found for this date.
        </div>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  {task.assignedUser
                    ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                    : "Unassigned"}
                </td>
                <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                <td>
                  <Button
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(task)}
                    title="Edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    color={task.remindersEnabled ? "success" : "secondary"}
                    size="sm"
                    className="me-2"
                    onClick={() => onToggleReminders(task)}
                    title={
                      task.remindersEnabled ? "Reminders On" : "Reminders Off"
                    }>
                    <FontAwesomeIcon
                      icon={task.remindersEnabled ? faBell : faBellSlash}
                    />
                  </Button>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(task.id)}
                    title="Delete">
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <TaskModal
        isOpen={modalOpen}
        toggle={toggleModal}
        onSave={async (task) => {
          if ("id" in task) {
            await onUpdateTask(task as TaskUpdateRequest);
          } else {
            await onAddTask(task as TaskAddRequest);
          }
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default TasksPane;
