"use client";

import { useState } from "react";
import { AddUserToProject } from "@/app/lib/server/userServer";
import { getTranslation } from "../lib/i18n";

interface Props {
  projectId: string;
  onUserAdded?: (user: any) => void;
  label?: string;
}

export default function AddUserToProjectForm({
  projectId,
  onUserAdded,
  label = "Add User",
  onClose,
}: {
  projectId: string;
  onUserAdded: (user: any) => void;
  label?: string;
  onClose?: () => void;
}) {
    const t = getTranslation();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddUser = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");

      const addedUser = await AddUserToProject(
        projectId,
        email.trim()
      );

      // מחזיר לאבא אם רוצים לעדכן UI
      onUserAdded?.(addedUser);

      setEmail("");
    } catch (err: any) {
      if(err.message === "UserAlreadyExists"){
        setError(t("userAlreadyMember"));
      }
      else
      setError(err.message || t("failedToAddUser"));
    } finally {
      setLoading(false);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input
        type="email"
        placeholder={t("userEmail")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
      />

      <button onClick={handleAddUser} disabled={loading}>
        {loading ? t("adding") : t("addUser")}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
