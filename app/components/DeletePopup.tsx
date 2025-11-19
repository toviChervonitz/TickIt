"use client";

import React from "react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  taskTitle?: string;
}

export default function ConfirmDelete({ onConfirm, onCancel, taskTitle }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          width: "300px",
          borderRadius: "8px",
          boxShadow: "0 0 12px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Are you sure?</h3>
        <p style={{ marginBottom: "20px" }}>
          Delete task: <strong>{taskTitle}</strong>?
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onCancel}>Cancel</button>

          <button
            onClick={onConfirm}
            style={{ backgroundColor: "red", color: "white", padding: "5px 10px" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
