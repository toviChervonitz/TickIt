"use client";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { IProject, IProjectRole, ITask, IUserSafe } from "../models/types";

interface AppState {
  user: IUserSafe | null;
  projectId: string | null;
  projectUsers: IUserSafe[];
  projectTasks: ITask[];
  tasks: ITask[];
  projects: IProjectRole[];

  setUser: (user: IUserSafe | null) => void;
  setProjectId: (projectId: string) => void;
  setProjectUsers: (projectUsers: IUserSafe[]) => void;
  setProjectTasks: (projectTasks: ITask[]) => void;
  setTasks: (tasks: ITask[]) => void;
  setProjects: (projects: IProjectRole[]) => void;

  initRealtime: () => void;
  eventSource: EventSource | null;

  logout: () => void;
}

type MyPersist = PersistOptions<AppState, AppState>;

const useAppStore = create(
  persist<AppState>(
    (set, get) => ({
      user: null,
      projectId: null,
      projectUsers: [],
      projectTasks: [],
      tasks: [],
      projects: [],

      eventSource: null,

      setUser: (user) =>
        set((state) => ({ ...state, user })),

      setProjectId: (projectId) =>
        set((state) => ({ ...state, projectId })),

      setProjectUsers: (projectUsers) =>
        set((state) => ({ ...state, projectUsers })),

      setProjectTasks: (projectTasks) =>
        set((state) => ({ ...state, projectTasks })),

      setTasks: (tasks) =>
        set((state) => ({ ...state, tasks })),

      setProjects: (projects) =>
        set((state) => ({ ...state, projects })),

      // ⭐⭐⭐ ADD THIS: Real-time subscription
      initRealtime: () => {
        if (typeof window === "undefined") return;

        // Prevent duplicate connections
        if (get().eventSource) return;

        const es = new EventSource("/api/events/tasks");

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "taskCreated") {
              const currentTasks = get().tasks;
              set({ tasks: [...currentTasks, data.task] });
            }
          } catch (err) {
            console.error("Realtime parse error:", err);
          }
        };

        es.onerror = () => {
          console.warn("SSE connection error - reconnecting in 5s");
          es.close();
          set({ eventSource: null });
          setTimeout(() => get().initRealtime(), 5000);
        };

        set({ eventSource: es });
      },

      logout: () => {
        const es = get().eventSource;
        if (es) es.close();

        set({
          user: null,
          projectId: null,
          projectUsers: [],
          projectTasks: [],
          tasks: [],
          projects: [],
          eventSource: null,
        });
      },
    }),
    {
      name: "task-manager-storage",
      partialize: (state) => ({
        user: state.user,
        projectId: state.projectId,
        projectUsers: state.projectUsers,
        projectTasks: state.projectTasks,
        tasks: state.tasks,
        projects: state.projects,
      }),
    } as MyPersist
  )
);

export default useAppStore;
