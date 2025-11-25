"use client";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import Pusher from "pusher-js";
import { IProjectRole, ITask, IUserSafe } from "../models/types";

type PusherClient = Pusher;

interface AppState {
  user: IUserSafe | null;
  projectId: string | null;
  projectUsers: IUserSafe[];
  projectTasks: ITask[];
  tasks: ITask[];
  projects: IProjectRole[];
  pusherClient: PusherClient | null;

  setUser: (user: IUserSafe | null) => void;
  setProjectId: (projectId: string) => void;
  setProjectUsers: (projectUsers: IUserSafe[]) => void;
  setProjectTasks: (projectTasks: ITask[]) => void;
  setTasks: (tasks: ITask[]) => void;
  setProjects: (projects: IProjectRole[]) => void;
  logout: () => void;
  initializeRealtime: (userId: string) => void;
}

type MyPersist = PersistOptions<AppState, AppState>;

const useAppStore = create(
  persist<AppState>(
    (set, get) => ({
      user: null,
      projectId: null,//current project id
      projectUsers: [],//user of current project
      projectTasks: [],//tasks of current project
      tasks: [],//all tasks
      projects: [],//all projects
      pusherClient: null,

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

      initializeRealtime: (userId: string) => {
        const state = get();
        if (state.pusherClient && (state.pusherClient as any).connection.state === 'connected') {
          console.log("Pusher already initialized and connected.");
          return;
        }

        console.log(`Initializing Pusher for user ${userId}`);

        const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          authEndpoint: "/api/pusher/auth",
          auth: {
            params: {
              userId: userId
            }
          }
        }) as PusherClient;

        set({ pusherClient });

        const channel = pusherClient.subscribe(`private-user-${userId}`);

        channel.bind("pusher:subscription_succeeded", () => {
          console.log(`Subscribed to private-user-${userId}`);
        });

        channel.bind("task-updated", (data: { action: "ADD" | "UPDATE" | "DELETE", task?: ITask, taskId?: string }) => {
          console.log("Real-time Task Update Received:", data.action, data.task || data.taskId);

          const state = get();
          const currentTasks = state.tasks;
          let newTasks: ITask[] = [];

          switch (data.action) {
            case "ADD":
              // מוסיפים רק אם המשימה עוד לא קיימת ב-Store
              if (data.task && !currentTasks.some(t => t._id === data.task!._id)) {
                newTasks = [data.task, ...currentTasks];
              } else {
                newTasks = currentTasks;
              }
              break;

            case "UPDATE":
              // עדכון אובייקט קיים
              newTasks = currentTasks.map(t =>
                // שימוש ב-spread operator כדי למזג את השדות המעודכנים (data.task)
                t._id === data.task?._id ? { ...t, ...data.task } as ITask : t
              );
              break;

            case "DELETE":
              // פילטור המשימה שנמחקה/הועברה משם
              newTasks = currentTasks.filter(t => t._id !== data.taskId);
              break;

            default:
              newTasks = currentTasks;
          }

          // ⭐ עדכון המערכים ב-Store ⭐
          set({
            tasks: newTasks,
            // עדכון projectTasks: אם הפרויקט הנוכחי מוגדר, מסנן את המשימות ששייכות לו
            projectTasks: state.projectId
              ? newTasks.filter(t => t?.projectId!.toString() === state.projectId)
              : state.projectTasks
          });
        });
      },

      logout: () => {
        const state = get();

        if (state.pusherClient) {
          state.pusherClient.disconnect();
          console.log("Pusher disconnected on logout.");
        }

        set({
          user: null,
          projectId: null,
          projectUsers: [],
          projectTasks: [],
          tasks: [],
          projects: [],
          pusherClient: null,
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
