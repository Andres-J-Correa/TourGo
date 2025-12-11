import React, { useMemo } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { Formik, Form, type FormikHelpers } from "formik";
import {
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import { useAppContext } from "contexts/GlobalAppContext";
import CustomField from "components/commonUI/forms/CustomField";
import DateTimePicker from "components/commonUI/forms/DateTimePicker";
import { useTaskValidationSchema } from "./schemas";

interface TaskModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (task: TaskAddRequest | TaskUpdateRequest) => Promise<boolean | void>;
  taskToEdit?: Task | null;
  currentUserId?: number;
}

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  assignedUserId: string;
  remindersEnabled: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  toggle,
  onSave,
  taskToEdit,
}) => {
  const { user } = useAppContext();
  const validationSchema = useTaskValidationSchema();

  const initialValues = useMemo(() => {
    if (taskToEdit) {
      return {
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate,
        assignedUserId: taskToEdit.assignedUser?.id || "",
        remindersEnabled: taskToEdit.remindersEnabled,
      };
    }
    return {
      title: "",
      description: "",
      dueDate: "",
      assignedUserId: String(user.current.id),
      remindersEnabled: true,
    };
  }, [taskToEdit, user]);

  const handleSubmit = async (
    values: TaskFormValues,
    { setSubmitting }: FormikHelpers<TaskFormValues>
  ) => {
    setSubmitting(true);
    const taskData = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      assignedUserId: values.assignedUserId,
      remindersEnabled: values.remindersEnabled,
    };

    let result;
    if (taskToEdit) {
      result = await onSave({ ...taskData, id: taskToEdit.id });
    } else {
      result = await onSave(taskData);
    }

    setSubmitting(false);
    if (result) {
      toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {taskToEdit ? "Update Task" : "Add Task"}
      </ModalHeader>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize>
        {({ isSubmitting, values, handleChange, handleBlur }) => (
          <Form>
            <ModalBody>
              <CustomField
                name="title"
                type="text"
                placeholder="Title"
                isRequired={true}
              />
              <CustomField
                name="description"
                as="textarea"
                placeholder="Description"
                style={{ height: "100px" }}
                isRequired={false}
              />
              <DateTimePicker
                name="dueDate"
                placeholder="Due Date"
                className="mb-3"
                isRequired={true}
              />
              <CustomField
                name="assignedUserId"
                type="text"
                placeholder="Assignee ID"
                isRequired={true}
              />

              <FormGroup check className="mt-3">
                <Label check>
                  <Input
                    type="checkbox"
                    name="remindersEnabled"
                    checked={values.remindersEnabled}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />{" "}
                  Enable Reminders
                </Label>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={toggle}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default TaskModal;
