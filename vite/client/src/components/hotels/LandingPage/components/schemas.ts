import * as Yup from "yup";

import { useLanguage } from "contexts/LanguageContext";

export const useTaskValidationSchema = () => {
  const { t } = useLanguage();

  return Yup.object().shape({
    title: Yup.string()
      .required(t("tasks.validation.titleRequired"))
      .min(2, t("tasks.validation.titleMin", { min: 2 }))
      .max(100, t("tasks.validation.titleMax", { max: 100 })),
    dueDate: Yup.string().required(t("tasks.validation.dueDateRequired")),
    assignedUserId: Yup.string().required(
      t("tasks.validation.assigneeRequired")
    ),
    description: Yup.string()
      .nullable()
      .max(500, t("tasks.validation.descriptionMax", { max: 500 })),
    remindersEnabled: Yup.boolean(),
  });
};
