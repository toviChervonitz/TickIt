import React, { useEffect, useState } from 'react'
import { UpdateProject } from '../lib/server/projectServer';
import { getTranslation } from '../lib/i18n';
import { useLanguage } from '../context/LanguageContext';

export interface ProjectForm{
    _id: string;
    name: string;
    description: string;
}

interface EditProjectProps {
    project: ProjectForm|null;
    onSaved: () => void;
    onCancel: () => void;
}

const EditProject =({
    project: initialProject,
    onSaved,
    onCancel,
}: EditProjectProps) => {
      const { lang } = useLanguage();
      const t = getTranslation(lang);
  
    const [project, setProject]=useState<ProjectForm>(initialProject!);
    const [mounted, setMounted] = useState(false);
    
      useEffect(() => {
        setMounted(true);
      }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
      };
        const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project._id) return console.log("Error: project ID missing");
        try {
          await UpdateProject(project._id, {
            name: project.name,
            description: project.description,
            });
            onSaved();
        } catch (err: any) {
          console.error("Error updating project:", err);
        }
        };
    if (!mounted) return null;
  return (
    <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "400px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
          {t("editProject")}
        </h2>

        <label>
          {t("title")}:
          <input
            name="name"
            type="text"
            value={project.name}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          />
        </label>

        <label>
          {t("content")}:
          <textarea
            name="description"
            value={project.description}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          />
        </label>
        

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={onCancel} // ONLY cancel closes the modal now
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "white",
              cursor: "pointer",
            }}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("saveChanges")}
          </button>
        </div>
      </form>
  )
}

export default EditProject