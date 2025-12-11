import * as Yup from "yup";

export const useTaskValidationSchema = () => {
  return Yup.object().shape({
    title: Yup.string()
      .required("Title is required")
      .min(2, "Title must be at least 2 characters long")
      .max(100, "Title must be at most 100 characters long"),
    dueDate: Yup.string().required("Due Date is required"),
    assignedUserId: Yup.string().required("Assignee ID is required"),
    description: Yup.string()
      .nullable()
      .max(500, "Description must be at most 500 characters long"),
    remindersEnabled: Yup.boolean(),
  });
};
