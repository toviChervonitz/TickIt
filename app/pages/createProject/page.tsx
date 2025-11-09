"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreateProject } from "@/app/lib/server/projectServer";
import { AddUserToProject, AddManagerToProject } from "@/app/lib/server/userServer";
import useAppStore from "@/app/store/useAppStore";
import "./createProject.css";

interface ProjectDetails {
  name: string;
  description: string;
}

interface User {
  name: string;
  email: string;
  _id: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { setProjectId, setProjectUsers, projectUsers } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<string>("");
  const [projectId, setLocalProjectId] = useState<string>(""); // local state
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleNext = async (): Promise<void> => {
    if (loading) return;
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Create the project
      const result = await CreateProject(projectDetails);
      if (!result?.project?._id) throw new Error("Invalid project ID");

      const newProjectId = result.project._id;
      setLocalProjectId(newProjectId);
      setProjectId(newProjectId);       // save to zustand
      setProjectUsers([]);               // initialize empty users in store

      // 2️⃣ Automatically add current user as manager
      const manager = await AddManagerToProject(newProjectId);

      setProjectUsers([manager]);        // add manager to zustand
      setUsers([manager]);               // add manager to local state

      // 3️⃣ Move to next step
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (): Promise<void> => {
    if (!newUser.trim() || !projectId) return;
    try {
      setLoading(true);
      setError("");

      const addedUser = await AddUserToProject(projectId, newUser.trim());

      if (projectUsers.some((u) => u.email === addedUser.email)) {
        setError("User already added.");
        return;
      }

      setProjectUsers([...projectUsers, addedUser]);
      setUsers([...users, addedUser]);
      setNewUser("");
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUser(e.target.value);
  };

  return (
    <div className="create-project-page">
      {step === 1 && (
        <div className="create-project-section">
          <h2>Project Details</h2>
          <p>Enter the name and description for your project.</p>

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
            <button
              type="button"
              className="step-button"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? "Creating..." : "Next"}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="create-project-section">
          <h2>Add Users</h2>
          <p>Add users who will collaborate on this project.</p>

          <form
            className="create-project-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddUser();
            }}
          >
            <input
              type="text"
              placeholder="User email"
              value={newUser}
              onChange={handleUserInput}
              onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <ul>
            {users.map((user) => (
              <li key={user._id}>
                {user.name} ({user.email}) {user._id === users[0]._id && "(Manager)"}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button onClick={() => setStep(1)} disabled={loading}>
              Back
            </button>
            <button
              onClick={() => router.push("/pages/addTask")}
              disabled={loading}
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
