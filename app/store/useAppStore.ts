"use client";
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import Pusher from "pusher-js";
import {
  IChatMessage,
  IProject,
  IProjectRole,
  ITask,
  IUserSafe,
  Lang,
} from "../models/types";
import { getIsArchived } from "../lib/server/projectServer";

type PusherClient = Pusher;

interface AppState {
  user: IUserSafe | null;
  projectId: string | null;
  projectUsers: IUserSafe[];
  projectTasks: ITask[];
  tasks: ITask[];
  projects: IProjectRole[];
  pusherClient: PusherClient | null;
  messages: IChatMessage[];
  language: Lang;
  showArchive: boolean;

  setUser: (user: IUserSafe | null) => void;
  setProjectId: (projectId: string) => void;
  setProjectUsers: (projectUsers: IUserSafe[]) => void;
  setProjectTasks: (projectTasks: ITask[]) => void;
  setTasks: (tasks: ITask[]) => void;
  setProjects: (
    projects: IProjectRole[] | ((prev: IProjectRole[]) => IProjectRole[])
  ) => void;
  getProjectName: (projectId: string) => string | null;
  setLanguage: (lang: Lang) => void;
  setShowArchive: (showArchive: boolean) => void;
  setMessages: (messages: IChatMessage[]) => void;
  logout: () => void;
  initializeRealtime: (userId: string) => void;
  subscribeToProjectUpdates: (projectId: string) => void;
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
      pusherClient: null,
      messages: [],
      language: "en",
      showArchive: false,

      setUser: (user) => set((state) => ({ ...state, user })),

      setProjectId: (projectId) => set((state) => ({ ...state, projectId })),

      setProjectUsers: (projectUsers) =>
        set((state) => ({ ...state, projectUsers })),

      setProjectTasks: (projectTasks) =>
        set((state) => ({ ...state, projectTasks })),

      setTasks: (tasks) => set((state) => ({ ...state, tasks })),

      setProjects: (projectsOrUpdater) =>
        set((state) => {
          let newProjects;

          if (typeof projectsOrUpdater === "function") {
            newProjects = projectsOrUpdater(state.projects);
          } else {
            newProjects = projectsOrUpdater;
          }

          return { ...state, projects: newProjects };
        }),
      getProjectName: (projectId: string) => {
        const projects = get().projects;
        const projectRole = projects.find((p) => p.project._id === projectId);
        return projectRole?.project?.name || null;
      },
      setLanguage: (language: Lang) => set({ language }),
      setShowArchive: (showArchive: boolean) => set({ showArchive }),
      setMessages: (
        messagesOrFn:
          | IChatMessage[]
          | ((prev: IChatMessage[]) => IChatMessage[])
      ) =>
        set((state) => ({
          ...state,
          messages:
            typeof messagesOrFn === "function"
              ? messagesOrFn(state.messages)
              : messagesOrFn,
        })),

      subscribeToProjectUpdates: (projectId: string) => {
        const state = get();
        const pusherClient = state.pusherClient;

        if (!pusherClient) {
          console.error("Pusher Client not initialized.");
          return;
        }

        const channelName = `private-project-${projectId}`;

        if (pusherClient.channel(channelName)?.subscribed) {
          return;
        }

        const channel = pusherClient.subscribe(channelName);

        channel.bind("pusher:subscription_succeeded", () => {
        });

        channel.bind(
          "project-updated",
          (data: { action: "UPDATE"; project: IProject }) => {

            const currentProjects = get().projects;
            const updatedProjects = currentProjects.map((p) => {
              if (p.project._id === data.project._id) {
                return {
                  ...p,
                  project: data.project,
                } as IProjectRole;
              }
              return p;
            });

            set({ projects: updatedProjects });
          }
        );
      },

      initializeRealtime: (userId: string) => {
        const state = get();
        if (
          state.pusherClient &&
          (state.pusherClient as any).connection.state === "connected"
        ) {
          return;
        }

        const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          authEndpoint: "/api/pusher/auth",
          auth: {
            params: {
              userId: userId,
            },
          },
        }) as PusherClient;

        set({ pusherClient });

        const channel = pusherClient.subscribe(`private-user-${userId}`);

        channel.bind("pusher:subscription_succeeded", () => {
        });

        channel.bind("project-list-updated", (data: { project: IProject }) => {
          const updatedProjectData = data.project;
          const currentProjects = get().projects;

          const updatedProjects = currentProjects.map((p) => {
            if (p.project._id === updatedProjectData._id) {
              return {
                ...p,
                project: updatedProjectData,
              };
            }
            return p;
          });

          set({ projects: updatedProjects });
        });

        channel.bind(
          "task-updated",
          async (data: {
            action: "ADD" | "UPDATE" | "DELETE";
            task?: ITask;
            taskId?: string;
          }) => {
            const state = get();

            if (data.action === "ADD" && data.task) {
              const exists = state.tasks.some((t) => t._id === data.task!._id);
              if (exists) return;

              const isArchived = await getIsArchived(
                String(data.task.projectId?._id)
              );

              if (isArchived) return;

              set({
                tasks: [data.task, ...state.tasks],
              });
            }

            if (data.action === "UPDATE" && data.task) {
              set({
                tasks: state.tasks.map((t) =>
                  t._id === data.task!._id ? { ...t, ...data.task } : t
                ),
              });
            }

            if (data.action === "DELETE" && data.taskId) {
              set({
                tasks: state.tasks.filter((t) => t._id !== data.taskId),
              });
            }

            if (!state.projectId) return;

            const taskProjectId =
              typeof data.task?.projectId === "object"
                ? data.task.projectId?._id
                : data.task?.projectId;

            if (taskProjectId !== state.projectId) return;

            if (data.action === "ADD" && data.task) {
              const exists = state.projectTasks.some(
                (t) => t._id === data.task!._id
              );
              if (!exists) {
                set({
                  projectTasks: [data.task, ...state.projectTasks],
                });
              }
            }

            if (data.action === "UPDATE" && data.task) {
              set({
                projectTasks: state.projectTasks.map((t) =>
                  t._id === data.task!._id ? { ...t, ...data.task } : t
                ),
              });
            }

            if (data.action === "DELETE" && data.taskId) {
              set({
                projectTasks: state.projectTasks.filter(
                  (t) => t._id !== data.taskId
                ),
              });
            }
          }
        );
      },

      logout: () => {
        const state = get();

        if (state.pusherClient) {
          state.pusherClient.disconnect();
        }

        set({
          user: null,
          projectId: null,
          projectUsers: [],
          projectTasks: [],
          tasks: [],
          projects: [],
          language: "en",
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
        language: state.language,
      }),
    } as MyPersist
  )
);

export default useAppStore;
