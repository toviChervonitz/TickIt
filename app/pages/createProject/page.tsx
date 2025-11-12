"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { CreateProject } from "@/app/lib/server/projectServer";
import { AddUserToProject, AddManagerToProject } from "@/app/lib/server/userServer";
import { CreateTask } from "@/app/lib/server/taskServer";
import useAppStore from "@/app/store/useAppStore";
import "./createProject.css";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";

interface ProjectDetails {
  name: string;
  description: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { setProjectId, setProjectUsers, projectUsers } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });
  const { user } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState<string>("");
  const [projectIdLocal, setProjectIdLocal] = useState<string>("");
  const [tasks, setTasks] = useState<TaskFormData[]>([]);
  const [task, setTask] = useState<TaskFormData>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Step 1: Create project and add manager
  const handleNextStep1 = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const result = await CreateProject(projectDetails, user?._id!);
      if (!result?.project?._id) throw new Error("Invalid project ID");

      const newProjectId = result.project._id;
      setProjectIdLocal(newProjectId);
      setProjectId(newProjectId);
      setProjectUsers([]);

      // Add current user as manager
      const manager = await AddManagerToProject(user?._id!, newProjectId);
      setProjectUsers([manager]);
      setUsers([manager]);

      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add user
  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !projectIdLocal) return;
    if (users.some((u) => u.email === newUserEmail.trim())) {
      setError("User already added.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const addedUser = await AddUserToProject(user?._id!, projectIdLocal, newUserEmail.trim());
      const updatedUsers = [...users, addedUser];
      setUsers(updatedUsers);
      setProjectUsers(updatedUsers);
      setNewUserEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Add and immediately create task
  const handleAddTask = async () => {
    if (!task.title || !task.userId || !task.dueDate) {
      setError("Please fill all fields for the task.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Send to backend immediately
      const createdTask = await CreateTask({
        ...task,
        projectId: projectIdLocal,
        userId: user?._id!,
      });

      // Make sure to handle both shapes: { task: {...} } or plain {...}
      const realTask = createdTask.task || createdTask;

      // Update frontend display
      setTasks((prev) => [...prev, realTask]);
      setTask({ title: "", content: "", userId: "", dueDate: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Finish project
  const handleFinish = async () => {
    alert("Project created successfully!");
    router.push("/dashboard");
  };

  const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="create-project-page">
      {/* Step 1: Project Details */}
      {step === 1 && (
        <div className="create-project-section">
          <h2>Project Details</h2>
          <form className="create-project-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={projectDetails.name}
              onChange={handleProjectChange}
              required
            />
            <textarea
              name="description"
              placeholder="Project Description"
              value={projectDetails.description}
              onChange={handleProjectChange}
              required
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="button" onClick={handleNextStep1} disabled={loading}>
              {loading ? "Creating..." : "Next"}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Add Users */}
      {step === 2 && (
        <div className="create-project-section">
          <h2>Add Users</h2>
          <input
            type="text"
            placeholder="User Email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
          />
          <button onClick={handleAddUser} disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <ul>
            {users.map((u) => (
              <li key={u._id}>
                {u.name} ({u.email}) {u._id === users[0]._id && "(Manager)"}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => setStep(1)} disabled={loading}>Back</button>
            <button onClick={() => setStep(3)} disabled={loading || users.length === 0}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Add Tasks */}
      {step === 3 && (
        <div className="create-project-section">
          <h2>Add Tasks</h2>
          <TaskForm task={task} setTask={setTask} onSubmit={handleAddTask} />
          {error && <p style={{ color: "red" }}>{error}</p>}

          {tasks.length > 0 && (
            <ul style={{ marginTop: "1rem" }}>
              {tasks.map((t, idx) => (
                <li key={idx}>
                  {t.title || "(No Title)"} -{" "}
                  {projectUsers.find((u) => u._id === t.userId)?.email || "(Unknown User)"}
                </li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => setStep(2)} disabled={loading}>Back</button>
            <button onClick={handleFinish} disabled={loading}>
              {loading ? "Finishing..." : "Finish Project"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
