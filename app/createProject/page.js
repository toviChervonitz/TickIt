"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import './createProject.css';

export default function CreateProjectPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Step 1: Project Details
  const [projectDetails, setProjectDetails] = useState({
    name: "",
    description: "",
  });

  // Step 2: Users
  const [users, setUsers] = useState([]); // confirmed users list
  const [newUser, setNewUser] = useState(""); // input value
  const [error, setError] = useState(""); // error for invalid users

  // Add user function (stub for backend check)
  const handleAddUser = async () => {
    if (!newUser.trim()) return;

    // stub: pretend we check backend and user exists
    // you will replace this with real backend call
    const fakeBackendCheck = (email) => {
      return { name: email.split('@')[0], email };
    };

    try {
      const user = fakeBackendCheck(newUser.trim());

      // check if user already added
      if (users.some(u => u.email === user.email)) {
        setError("User already added.");
        return;
      }

      setUsers([...users, user]);
      setNewUser("");
      setError("");
    } catch (err) {
      setError("User not found.");
    }
  };

  // Next step function (stub for backend project creation)
  const handleNext = async () => {
    // stub: here you would send projectDetails + users to backend
    console.log("Creating project with:", { projectDetails, users });

    // navigate to next page
    router.push("/nextPage"); // change to your next page
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="create-project-page">

      {/* Step 1 - Project Details */}
      {step === 1 && (
        <div className="create-project-section">
          <h2>Project Details</h2>
          <p>Enter the name and description for your project.</p>

          <form className="create-project-form" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              placeholder="Project Name"
              value={projectDetails.name}
              onChange={e =>
                setProjectDetails({ ...projectDetails, name: e.target.value })
              }
            />
            <textarea
              placeholder="Project Description"
              value={projectDetails.description}
              onChange={e =>
                setProjectDetails({ ...projectDetails, description: e.target.value })
              }
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" className="step-button" onClick={nextStep}>
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
            onSubmit={e => {
              e.preventDefault();
              handleAddUser();
            }}
          >
            <input
              type="text"
              placeholder="User email"
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddUser()}
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
      <li key={idx}>{user.name} ({user.email})</li>
    ))}
  </ul>
</div>


          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button className="step-button" onClick={prevStep}>Back</button>
            <button className="step-button" onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

    </div>
  );
}
