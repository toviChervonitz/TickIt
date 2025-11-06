"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import "./createProject.css";

interface ProjectDetails {
  name: string;
  description: string;
}

interface Member {
  email: string;
}

export default function CreateProjectPage() {
  const [step, setStep] = useState<number>(1);

  // Step 1: Project Details
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });

  // Step 2: Members
  const [members, setMembers] = useState<Member[]>([]);
  const [newMember, setNewMember] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Add member function (stub for backend check)
  const handleAddMember = async (): Promise<void> => {
    if (!newMember.trim()) return;

    // stub: pretend we check backend and member exists
    const fakeBackendCheck = (email: string): Member => {
      return { email };
    };

    try {
      const member = fakeBackendCheck(newMember.trim());

      if (members.some((u) => u.email === member.email)) {
        setError("Member already added.");
        return;
      }

      setMembers([...members, member]);
      setNewMember("");
      setError("");
    } catch {
      setError("Member not found.");
    }
  };

  // Final project creation function
  const handleCreateProject = async (): Promise<void> => {
    try {
      console.log("Final project data:", {
        projectDetails,
        members,
      });

      // TODO: call your backend or perform any logic here
      // Example:
      // await createProjectAPI(projectDetails, members);

      alert("Project created successfully!"); // just for demo
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the project.");
    }
  };

  const nextStep = (): void => setStep((prev) => prev + 1);
  const prevStep = (): void => setStep((prev) => prev - 1);

  const handleProjectChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewMember(e.target.value);
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
              <button type="button" className="step-button" onClick={nextStep}>
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 - Add Members */}
      {step === 2 && (
        <div className="create-project-section">
          <h2>Add Members</h2>
          <p>Add members who will collaborate on this project.</p>

          <form
            className="create-project-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleAddMember();
            }}
          >
            <input
              type="text"
              placeholder="Member email"
              value={newMember}
              onChange={handleMemberInput}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
            <button type="submit" className="create-project-add-button">
              Add
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Members list */}
          <div className="members-list-wrapper">
            <ul className="members-list">
              {members.map((member, idx) => (
                <li key={idx}>{member.email}</li>
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
            <button className="step-button" onClick={handleCreateProject}>
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
