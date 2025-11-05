"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./createProject.css";

interface ProjectDetails {
  name: string;
  description: string;
}

interface User {
  name: string;
  email: string;
}

export default function CreateProjectPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);

  // Step 1: Project Details
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });

  // Step 2: Users
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Add user function (stub for backend check)
  const handleAddUser = async (): Promise<void> => {
    if (!newUser.trim()) return;

    // stub: pretend we check backend and user exists
    const fakeBackendCheck = (email: string): User => {
      return { name: email.split("@")[0], email };
    };

    try {
      const user = fakeBackendCheck(newUser.trim());

      if (users.some((u) => u.email === user.email)) {
        setError("User already added.");
        return;
      }

      setUsers([...users, user]);
      setNewUser("");
      setError("");
    } catch {
      setError("User not found.");
    }
  };

  // Next step function (stub for backend project creation)
  const handleNext = async (): Promise<void> => {
    console.log("Creating project with:", { projectDetails, users });
    router.push("/nextPage"); // change to your next page
  };

  const nextStep = (): void => setStep((prev) => prev + 1);
  const prevStep = (): void => setStep((prev) => prev - 1);

  const handleProjectChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewUser(e.target.value);
  };

  return (
    <div className="create-project-page">
      {/* Step 1 - Project Details */}
      {step === 1 && (
        <div className="create-project-section">
          <h2>Project Details</h2>
          <p>Enter the name and description for your project.</p>

          <form
            className="create-project-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
          >
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
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                className="step-button"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 - Add Users */}
      {step === 2 && (
        <div className="create-project-section">
          <h2>Add Users</h2>
          <p>Add users who will collaborate on this project.</p>

          <form
            className="create-project-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
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
            <button type="submit" className="create-project-add-button">
              Add
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Users list */}
          <div className="users-list-wrapper">
            <ul className="users-list">
              {users.map((user, idx) => (
                <li key={idx}>
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <button className="step-button" onClick={prevStep}>
              Back
            </button>
            <button className="step-button" onClick={handleNext}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
