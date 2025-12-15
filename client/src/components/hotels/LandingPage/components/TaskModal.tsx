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
  Spinner,
} from "reactstrap";
import { Formik, Form, type FormikHelpers } from "formik";
import {
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import { useLanguage } from "contexts/LanguageContext";
import CustomField from "components/commonUI/forms/CustomField";
import DateTimePicker from "components/commonUI/forms/DateTimePicker";
import { useTaskValidationSchema } from "./schemas";
import type { Staff } from "types/entities/staff.types";
import dayjs from "dayjs";

interface TaskModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSave: (task: TaskAddRequest | TaskUpdateRequest) => Promise<boolean | void>;
  taskToEdit?: Task | null;
  staff: Staff[];
  loadingStaff: boolean;
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
  staff,
  loadingStaff,
}) => {
  const { t } = useLanguage();
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
      assignedUserId: "",
      remindersEnabled: true,
    };
  }, [taskToEdit]);

  const handleSubmit = async (
    values: TaskFormValues,
    { setSubmitting }: FormikHelpers<TaskFormValues>
  ) => {
    setSubmitting(true);
    const taskData = {
      title: values.title,
      description: values.description,
      dueDate: dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      assignedUserId: values.assignedUserId,
      remindersEnabled: values.remindersEnabled,
    };

    let result;
    if (taskToEdit?.id) {
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
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize>
      {({ isSubmitting, values, handleChange, handleBlur }) => (
        <Modal
          isOpen={isOpen}
          toggle={!isSubmitting ? toggle : undefined}
          centered
          backdrop={isSubmitting ? "static" : true}
          keyboard={!isSubmitting}>
          <Form>
            <ModalHeader toggle={!isSubmitting ? toggle : undefined}>
              {taskToEdit?.id ? t("tasks.updateTask") : t("tasks.addTask")}
            </ModalHeader>
            <ModalBody>
              <CustomField
                name="title"
                type="text"
                placeholder={t("tasks.form.titlePlaceholder")}
                isRequired={true}
              />
              <CustomField
                name="description"
                as="textarea"
                placeholder={t("tasks.form.descriptionPlaceholder")}
                style={{ height: "100px" }}
                isRequired={false}
              />
              <CustomField
                name="assignedUserId"
                as="select"
                placeholder={t("tasks.form.assignee")}
                isRequired={true}>
                <option value="">
                  {loadingStaff
                    ? t("common.loading")
                    : t("tasks.form.assigneePlaceholder")}
                </option>
                {staff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </CustomField>

              <Label>{t("tasks.form.dueDatePlaceholder")}</Label>
              <DateTimePicker
                name="dueDate"
                placeholder={t("tasks.form.dueDatePlaceholder")}
                className="mb-3"
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
                  {t("tasks.form.enableReminders")}
                </Label>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={toggle}
                disabled={isSubmitting}>
                {t("tasks.form.cancel")}
              </Button>
              <Button color="dark" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {t("tasks.form.saving")}
                  </>
                ) : (
                  t("tasks.form.save")
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      )}
    </Formik>
  );
};

export default TaskModal;
