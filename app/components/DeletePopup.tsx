"use client";

import React from "react";
import { getTranslation } from "../lib/i18n";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  taskTitle?: string;
}

export default function ConfirmDelete({ onConfirm, onCancel, taskTitle }: Props) {
    const { lang } = useLanguage();
    const t = getTranslation(lang);
  
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
        <h3 style={{ marginBottom: "10px" }}>{t("areYouSure")}</h3>
        <p style={{ marginBottom: "20px" }}>
          {t("deleteTask")}: <strong>{taskTitle}</strong>?
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onCancel}>Cancel</button>

          <button
            onClick={onConfirm}
            style={{ backgroundColor: "red", color: "white", padding: "5px 10px" }}
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
