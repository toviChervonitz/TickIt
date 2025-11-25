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

      initRealtime: () => {
        if (typeof window === "undefined") return;
        if (get().eventSource) return;

        console.log("📡 initRealtime called");

        const es = new EventSource("/api/events/tasks");

        es.onopen = () => {
          console.log("🟢 SSE connected!");
        };

        es.onmessage = (event) => {
          console.log("📨 SSE message received:", event.data);
          const data = JSON.parse(event.data);

          if (data.type === "taskCreated") {
            const newTask = data.task;
            const currentUser = get().user;
            const currentTasks = get().tasks;

            if (!currentUser) return;

            const isAssignedToMe =
              newTask.userId === currentUser._id ||
              newTask.userId?._id === currentUser._id;

            if (!isAssignedToMe) {
              return;
            }

            set({ tasks: [newTask, ...currentTasks] });
          }
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
