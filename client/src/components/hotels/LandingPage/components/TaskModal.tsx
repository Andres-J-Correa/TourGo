import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import { useAppContext } from "contexts/GlobalAppContext";
// Note: We might need a user selector here in the future.
// For now, we'll assume the current user is the assignee or provide a simple input.
// Given requirement: "AssigneeId". I'll put a placeholder input for now or fetch users if I could.
// But the user didn't ask for user fetching logic yet, so I'll stick to a simple input or just use current user if possible?
// The prompt said "Display... AssigneeId".
// The Request models need "AssignedUserId".
// I'll add a numeric input for AssignedUserId for now to satisfy the API contract.

interface TaskModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (task: TaskAddRequest | TaskUpdateRequest) => Promise<boolean | void>;
  taskToEdit?: Task | null;
  currentUserId?: number; // fallback if needed
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  toggle,
  onSave,
  taskToEdit,
}) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string>(user.current.id);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      // taskToEdit.dueDate is ISO string, input type="date" needs YYYY-MM-DD
      // or type="datetime-local" needs YYYY-MM-DDThh:mm
      const datePart = taskToEdit.dueDate.split("T")[0];
      setDueDate(datePart ?? "");
      setAssignedUserId(taskToEdit.assignedUser?.id || "");
      setRemindersEnabled(taskToEdit.remindersEnabled);
    } else {
      resetForm();
    }
  }, [taskToEdit, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    const today = new Date().toISOString().split("T")[0];
    setDueDate(today ?? "");
    setAssignedUserId(user.current.id); // Default to 0 or current user if available
    setRemindersEnabled(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const taskData = {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      assignedUserId,
      remindersEnabled,
    };

    let result;
    if (taskToEdit) {
      result = await onSave({ ...taskData, id: taskToEdit.id });
    } else {
      result = await onSave(taskData);
    }

    setIsSubmitting(false);
    if (result) {
      toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {taskToEdit ? "Update Task" : "Add Task"}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="taskTitle">Title</Label>
            <Input
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="taskDescription">Description</Label>
            <Input
              id="taskDescription"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="taskDueDate">Due Date</Label>
            <Input
              id="taskDueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="assignedUserId">Assignee ID</Label>
            <Input
              id="assignedUserId"
              type="text"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
              />{" "}
              Enable Reminders
            </Label>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default TaskModal;
