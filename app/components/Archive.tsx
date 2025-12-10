import { toArchive } from "../lib/server/projectServer";
import useAppStore from "../store/useAppStore";

interface ArchiveProps {
  projectId: string | undefined;
  userId: string;
  archived: boolean;
}

export default function Archive({ projectId, userId, archived }: ArchiveProps) {
  const { projects, setProjects } = useAppStore();

  async function archive(isArchive: boolean) {
    const res = await toArchive(projectId, userId, isArchive);
    if (res.ok) {
      // עדכון מקומי בסטור
      setProjects(
        projects.map((p) =>
          p.project._id === projectId ? { ...p, isArchived: isArchive } : p
        )
      );
    }

    console.log("return from archive-------------", res);
    console.log("state", archived);
  }
  return (
    <button onClick={() => archive(!archived)}>
      {archived ? "Restore" : "Archive"}
    </button>
  );
}
