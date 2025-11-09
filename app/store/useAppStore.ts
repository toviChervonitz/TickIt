import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ITask, IUser } from "../models/types";


interface AppState {
  user: IUser | null;
  projectId: string | null;
  projectUsers: IUser[];
  projectTasks: ITask[];
  tasks: ITask[];

  setUser: (user: IUser) => void;
  setProjectId: (projectId: string) => void;
  setProjectUsers: (projectUsers: IUser[]) => void;
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
