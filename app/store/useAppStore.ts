import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentProject: null,
      projects: [],
      tasks: [],

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProjects: (projects) => set({ projects }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentProject: null,
          projects: [],
          tasks: [],
        }),
    }),
    {
      name: 'task-manager-storage', 
    }
  )
);

export default useAppStore;
