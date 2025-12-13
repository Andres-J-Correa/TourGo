import axiosClient from "./axiosClientV2";
import type { AxiosRequestConfig } from "axios";
import { API_HOST_PREFIX, handleGlobalError } from "./serviceHelpersV2";
import type {
  ItemsResponse,
  ItemResponse,
  SuccessfulResponse,
  ApiResponse,
} from "../types/apiResponse.types";
import type { User } from "types/user.types";

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  remindersEnabled: boolean;
  isCompleted: boolean;
  assignedUser: User;
  createdBy: User;
  modifiedBy: User;
  dateCreated: string;
  dateModified: string;
}

export interface TaskAddRequest {
  title: string;
  description?: string;
  dueDate: string;
  assignedUserId: string;
  remindersEnabled: boolean;
}

export interface TaskUpdateRequest extends TaskAddRequest {
  id: number;
}

const endpoint = (hotelId: string) =>
  `${API_HOST_PREFIX}/hotel/${hotelId}/tasks`;

// Get tasks by date range
const getTasks = async (
  hotelId: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<ItemsResponse<Task>>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    url: `${endpoint(hotelId)}`,
    params: { startDate, endDate },
  };
  try {
    const response = await axiosClient<ItemsResponse<Task>>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

// Add a new task
const addTask = async (
  hotelId: string,
  task: TaskAddRequest
): Promise<ApiResponse<ItemResponse<number>>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    url: `${endpoint(hotelId)}`,
    data: task,
  };
  try {
    const response = await axiosClient<ItemResponse<number>>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

// Update an existing task
const updateTask = async (
  hotelId: string,
  task: TaskUpdateRequest
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    url: `${endpoint(hotelId)}/${task.id}`,
    data: task,
  };
  try {
    const response = await axiosClient<SuccessfulResponse>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

// Update task reminders
const updateReminders = async (
  hotelId: string,
  id: number,
  remindersEnabled: boolean
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${endpoint(hotelId)}/${id}/reminders`,
    params: { remindersEnabled },
  };
  try {
    const response = await axiosClient<SuccessfulResponse>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

// update task completed status
export const updateCompleted = async (
  hotelId: string,
  id: number,
  isCompleted: boolean
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    url: `${endpoint(hotelId)}/${id}/completed`,
    params: { isCompleted },
  };
  try {
    const response = await axiosClient<SuccessfulResponse>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

// Delete a task
const deleteTask = async (
  hotelId: string,
  id: number
): Promise<ApiResponse<SuccessfulResponse>> => {
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
    url: `${endpoint(hotelId)}/${id}`,
  };
  try {
    const response = await axiosClient<SuccessfulResponse>(config);
    return response.data;
  } catch (error: unknown) {
    return handleGlobalError(error);
  }
};

export { getTasks, addTask, updateTask, updateReminders, deleteTask };
