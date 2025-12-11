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

export const useTasks = (hotelId: string | undefined, date: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!hotelId || !date) return;
    setLoading(true);
    try {
      const response = await getTasks(hotelId, date, date);

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
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [hotelId, date]);

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
      toast.error("Failed to load staff");
    } finally {
      setLoadingStaff(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const addTask = async (task: TaskAddRequest) => {
    if (!hotelId) return;
    try {
      await addTaskService(hotelId, task);
      toast.success("Task added successfully");
      fetchTasks();
      return true;
    } catch (error) {
      console.error("Failed to add task", error);
      toast.error("Failed to add task");
      return false;
    }
  };

  const updateTask = async (task: TaskUpdateRequest) => {
    if (!hotelId) return;
    try {
      await updateTaskService(hotelId, task);
      toast.success("Task updated successfully");
      fetchTasks();
      return true;
    } catch (error) {
      console.error("Failed to update task", error);
      toast.error("Failed to update task");
      return false;
    }
  };

  const toggleReminders = async (task: Task) => {
    if (!hotelId) return;
    try {
      await updateRemindersService(hotelId, task.id);
      toast.success("Task reminders updated");
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, remindersEnabled: !t.remindersEnabled } : t
        )
      );
    } catch (error) {
      console.error("Failed to update reminders", error);
      toast.error("Failed to update reminders");
      fetchTasks(); // Revert on error
    }
  };

  const deleteTask = async (id: number) => {
    if (!hotelId) return;
    try {
      await deleteTaskService(hotelId, id);
      toast.success("Task deleted successfully");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
      toast.error("Failed to delete task");
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
