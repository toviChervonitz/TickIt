import { create } from "zustand";
import { persist } from "zustand/middleware";
import User from "../models/UserModel";
import Task from "../models/TaskModel";

const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      projectId: null,
      projectUsers: [],
      projectTasks: [],
      tasks: [],

      setUser: (user: typeof User) => set({ user }),
      setProjectId: (projectId: string) => set({ projectId }),
      setProjectUsers: (projectUsers: (typeof User)[]) => set({ projectUsers }),
      setProjectTasks: (projectTasks: (typeof Task)[]) => set({ projectTasks }),
      setTasks: (tasks: (typeof Task)[]) => set({ tasks }),
      logout: () =>
        set({
          user: null,
          projectId: null,
          projectUsers: [],
          projectTasks: [],
          tasks: [],
        }),
    }),
    {
      name: "task-manager-storage",
    }
  )
);

export default useAppStore;
