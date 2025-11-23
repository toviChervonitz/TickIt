// /app/config/kanbanConfig.ts - פלטה חמה ומודרנית

export interface KanbanColumnConfig {
  id: "todo" | "doing" | "done";
  title: string;
  color: string;
  bgColor: string;
}

export const KANBAN_COLUMNS_CONFIG: KanbanColumnConfig[] = [
  { 
    id: "todo", 
    title: "To Do", 
    color: "#F7F5F0", 
    bgColor: "rgba(222, 193, 151, 0.08)" 
  },
  { 
    id: "doing", 
    title: "In Progress", 
    color: "#3dd2cc", 
    bgColor: "rgba(154, 225, 231, 0.1)" 
  },
  { 
    id: "done", 
    title: "Completed", 
    color: "#1d486a", 
    bgColor: "rgba(13, 135, 129, 0.08)" 
  },
];