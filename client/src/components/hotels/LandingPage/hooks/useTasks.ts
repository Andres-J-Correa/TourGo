import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getTasks,
  addTask as addTaskService,
  updateTask as updateTaskService,
  updateReminders as updateRemindersService,
  deleteTask as deleteTaskService,
  updateCompleted as updateCompletedService,
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import { getByHotelId as getStaffByHotelId } from "services/staffService";
import type { Staff } from "types/entities/staff.types";
import { useLanguage } from "contexts/LanguageContext";
import dayjs from "dayjs";

export const useTasks = (
  hotelId: string | undefined,
  startDate: string | null,
  endDate: string | null
) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!hotelId || !startDate || !endDate) return;
    setLoading(true);
    try {
      const formattedStartDate = dayjs(startDate).format(
        "YYYY-MM-DDT00:00:00.SSSZ"
      );
      const formattedEndDate = dayjs(endDate).format(
        "YYYY-MM-DDT23:59:59.SSSZ"
      );

      const response = await getTasks(
        hotelId,
        formattedStartDate,
        formattedEndDate
      );

      if (response.isSuccessful) {
        setTasks(response.items || []);
      } else {
        if (response.error.status === 404) {
          setTasks([]);
        } else {
          throw response.error;
        }
      }
    } catch {
      toast.error(t("tasks.notifications.loadTasksError"));
    } finally {
      setLoading(false);
    }
  }, [hotelId, startDate, endDate, t]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchStaff = useCallback(async () => {
    if (!hotelId) return;
    setLoadingStaff(true);
    try {
      const response = await getStaffByHotelId(hotelId);

      if (response.isSuccessful) {
        setStaff(response.items || []);
      } else {
        if (response.error.status === 404) {
          setStaff([]);
        } else {
          throw response.error;
        }
      }
    } catch {
      toast.error(t("tasks.notifications.loadStaffError"));
    } finally {
      setLoadingStaff(false);
    }
  }, [hotelId, t]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const addTask = async (task: TaskAddRequest) => {
    if (!hotelId) return;
    setCreating(true);
    try {
      await addTaskService(hotelId, task);
      toast.success(t("tasks.notifications.addSuccess"));
      await fetchTasks();
      return true;
    } catch (error) {
      toast.error(t("tasks.notifications.addError"));
      return false;
    } finally {
      setCreating(false);
    }
  };

  const updateTask = async (task: TaskUpdateRequest) => {
    if (!hotelId) return;
    setUpdating(true);
    try {
      await updateTaskService(hotelId, task);
      toast.success(t("tasks.notifications.updateSuccess"));
      await fetchTasks();
      return true;
    } catch (error) {
      toast.error(t("tasks.notifications.updateError"));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const toggleReminders = async (task: Task) => {
    if (!hotelId) return;
    try {
      await updateRemindersService(hotelId, task.id, !task.remindersEnabled);
      toast.success(t("tasks.notifications.reminderSuccess"));
      setTasks((prev) => {
        return prev.map((t) => {
          if (t.id === task.id) {
            const newTask = { ...t };
            newTask.remindersEnabled = !task.remindersEnabled;
            return newTask;
          }
          return t;
        });
      });
    } catch (error) {
      toast.error(t("tasks.notifications.reminderError"));
    }
  };

  const deleteTask = async (id: number) => {
    if (!hotelId) return;
    try {
      await deleteTaskService(hotelId, id);
      toast.success(t("tasks.notifications.deleteSuccess"));
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      toast.error(t("tasks.notifications.deleteError"));
    }
  };

  const toggleCompleted = async (task: Task) => {
    if (!hotelId) return;
    try {
      await updateCompletedService(hotelId, task.id, !task.isCompleted);
      toast.success(t("tasks.notifications.updateSuccess"));
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === task.id) {
            const newTask = { ...t };
            newTask.isCompleted = !task.isCompleted;
            return newTask;
          }
          return t;
        })
      );
    } catch (error) {
      toast.error(t("tasks.notifications.updateError"));
    }
  };

  return {
    tasks,
    loading,
    creating,
    updating,
    addTask,
    updateTask,
    toggleReminders,
    deleteTask,
    refreshTasks: fetchTasks,
    staff,
    loadingStaff,
    toggleCompleted,
  };
};
