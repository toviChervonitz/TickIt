import { TaskFormData } from "@/app/components/AddTaskForm";

export const handleGenerateContent = async (
  projectSummary: string,
  projectId: string,
  lang: "en" | "he"
): Promise<TaskFormData[] | null> => {
  if (!projectSummary.trim() || !projectId.trim()) return null;

  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": projectId,
        "x-lang": lang
      },
      body: JSON.stringify({ userPrompt: projectSummary }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generating tasks failed");
    }

    // Ensure each task has title, content, dueDate
    const tasks: TaskFormData[] = (data || []).map((task: any) => ({
      title: task.title || "",
      content: task.content || "",
      dueDate: task.dueDate || "",
      userId: "",        // initially unassigned
      status: "todo",
    }));

    return tasks;
  } catch (err: any) {
    console.error("Generate Content Error:", err);
    return null;
  }
};

