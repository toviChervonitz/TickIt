"use client";

import { useState } from "react";
import { AddUserToProject } from "@/app/lib/server/userServer";

interface Props {
  projectId: string;
  onUserAdded?: (user: any) => void;
  label?: string;
}

export default function AddUserToProjectForm({ projectId, onUserAdded, label = "Add User" }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddUser = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");

      const addedUser = await AddUserToProject(undefined, projectId, email.trim());

      // מחזיר לאבא אם רוצים לעדכן UI
      onUserAdded?.(addedUser);

      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input
        type="email"
        placeholder="User Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
      />

      <button onClick={handleAddUser} disabled={loading}>
        {loading ? "Adding..." : label}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
