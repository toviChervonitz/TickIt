import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ITask, IUserSafe } from "../models/types";

interface AppState {
  user: IUserSafe | null;       // frontend safe user
  projectId: string | null;
  projectUsers: IUserSafe[];    // must include _id
  projectTasks: ITask[];
  tasks: ITask[];

  setUser: (user: IUserSafe) => void;
  setProjectId: (projectId: string) => void;
  setProjectUsers: (projectUsers: IUserSafe[]) => void;
  setProjectTasks: (projectTasks: ITask[]) => void;
  setTasks: (tasks: ITask[]) => void;
  logout: () => void;
}

const useAppStore = create(
  persist<AppState>(
    (set) => ({
      user: null,
      projectId: null,
      projectUsers: [],
      projectTasks: [],
      tasks: [],

      setUser: (user) => set({ user }),
      setProjectId: (projectId) => set({ projectId }),
      setProjectUsers: (projectUsers) => set({ projectUsers }),
      setProjectTasks: (projectTasks) => set({ projectTasks }),
      setTasks: (tasks) => set({ tasks }),
      logout: () => {
        set({
          user: null,
          projectId: null,
          projectUsers: [],
          projectTasks: [],
          tasks: [],
        }),
          localStorage.removeItem("task-manager-storage");
      }

    }),
    {
      name: "task-manager-storage", // key for localStorage
    }
  )
);

export default useAppStore;
