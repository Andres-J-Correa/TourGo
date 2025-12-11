import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getTasks,
  addTask as addTaskService,
  updateTask as updateTaskService,
  updateReminders as updateRemindersService,
  deleteTask as deleteTaskService,
  type Task,
  type TaskAddRequest,
  type TaskUpdateRequest,
} from "services/taskService";
import { getByHotelId as getStaffByHotelId } from "services/staffService";
import type { Staff } from "types/entities/staff.types";
import { useLanguage } from "contexts/LanguageContext";

export const useTasks = (
  hotelId: string | undefined,
  startDate: string | null,
  endDate: string | null
) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!hotelId || !startDate || !endDate) return;
    setLoading(true);
    try {
      const response = await getTasks(hotelId, startDate, endDate);

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
    try {
      await addTaskService(hotelId, task);
      toast.success(t("tasks.notifications.addSuccess"));
      fetchTasks();
      return true;
    } catch (error) {
      toast.error(t("tasks.notifications.addError"));
      return false;
    }
  };

  const updateTask = async (task: TaskUpdateRequest) => {
    if (!hotelId) return;
    try {
      await updateTaskService(hotelId, task);
      toast.success(t("tasks.notifications.updateSuccess"));
      fetchTasks();
      return true;
    } catch (error) {
      toast.error(t("tasks.notifications.updateError"));
      return false;
    }
  };

  const toggleReminders = async (task: Task) => {
    if (!hotelId) return;
    try {
      await updateRemindersService(hotelId, task.id);
      toast.success(t("tasks.notifications.reminderSuccess"));
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, remindersEnabled: !t.remindersEnabled } : t
        )
      );
    } catch (error) {
      toast.error(t("tasks.notifications.reminderError"));
      fetchTasks(); // Revert on error
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

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleReminders,
    deleteTask,
    refreshTasks: fetchTasks,
    staff,
    loadingStaff,
  };
};
