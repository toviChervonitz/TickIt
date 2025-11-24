"use client";

import React, { useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { TaskFormData } from "./AddTaskForm";
import { handleGenerateContent } from "../lib/server/agentServer";

interface GeneratedTask {
  title: string;
  content: string;
}

interface GenerateTasksProps {
  projectDescription: string;
  onAddTask: (task: TaskFormData) => void; // callback when user adds a task
}

export default function GenerateTasks({ projectDescription, onAddTask }: GenerateTasksProps) {
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [taskEdits, setTaskEdits] = useState<GeneratedTask | null>(null);

  const handleGenerate = async () => {
    if (!projectDescription.trim()) return;
    setLoading(true);

    const result = await handleGenerateContent(projectDescription , "fakeid");

    console.log("tasks that came back:", result);
    setGeneratedTasks(result);
    setLoading(false);
  };

  const handleAdd = (task: GeneratedTask) => {
    const newTask: TaskFormData = {
      title: task.title,
      content: task.content,
      userId: "",
      dueDate: new Date().toISOString().split("T")[0],
      status: "todo",
    };
    onAddTask(newTask);
    setGeneratedTasks((prev) => prev.filter((t) => t !== task));
  };

  const handleReject = (task: GeneratedTask) => {
    setGeneratedTasks((prev) => prev.filter((t) => t !== task));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTaskEdits(generatedTasks[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null || !taskEdits) return;
    const updatedTasks = [...generatedTasks];
    updatedTasks[editingIndex] = taskEdits;
    setGeneratedTasks(updatedTasks);
    setEditingIndex(null);
    setTaskEdits(null);
  };

  return (
    <div className="generate-tasks">
      {/* Show button only if no tasks are currently generated */}
      {generatedTasks.length === 0 && (
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Tasks"}
        </button>
      )}

      <div className="generated-task-list">
        {generatedTasks.map((task, index) => (
          <div key={index} className="generated-task-item border p-2 my-2">
            {editingIndex === index && taskEdits ? (
              <div>
                <input
                  type="text"
                  value={taskEdits.title}
                  onChange={(e) =>
                    setTaskEdits({ ...taskEdits, title: e.target.value })
                  }
                />
                <textarea
                  value={taskEdits.content}
                  onChange={(e) =>
                    setTaskEdits({ ...taskEdits, content: e.target.value })
                  }
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditingIndex(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <h4>{task.title}</h4>
                <div style={{ whiteSpace: "pre-wrap" }}>{task.content}</div>
                <button onClick={() => startEditing(index)}>Edit</button>
                <button onClick={() => handleAdd(task)}>Add</button>
                <button onClick={() => handleReject(task)}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
