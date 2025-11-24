
export interface KanbanColumnConfig {
  id: "todo" | "doing" | "done";
  title: string;
  color: string; // צבע עיקרי (לאייקון ול-Chip)
  bgColor: string; // רקע בהיר לעמודה
}

// פלטה 1: זרימה טבעית (הפלטה שבחרת)
export const KANBAN_COLUMNS_CONFIG: KanbanColumnConfig[] = [
  { 
    id: "todo", 
    title: "To Do", 
    color: "#eadcb8ff", // אפור מודרני
    bgColor: "rgba(183, 163, 126, 0.08)" 
  },
  { 
    id: "doing", 
    title: "In Progress", 
    color: "#3dd2cc", // כחול הייטק
    bgColor: "rgba(61, 210, 204, 0.08)" 
  },
  { 
    id: "done", 
    title: "Completed", 
    color: "#1d486a", // הטורקיז של המותג
    bgColor: "rgba(65, 137, 135, 0.08)" 
  },
];