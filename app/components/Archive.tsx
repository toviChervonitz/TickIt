import { toArchive } from "../lib/server/projectServer";
import { GetTasksByProjectId } from "../lib/server/taskServer";
import useAppStore from "../store/useAppStore";

interface ArchiveProps {
  projectId: string | undefined;
  userId: string;
  archived: boolean;
}

export default function Archive({ projectId, userId, archived }: ArchiveProps) {
  const { projects, setProjects, setTasks, tasks } = useAppStore();

  async function archive(isArchive: boolean) {
    const res = await toArchive(projectId, userId, isArchive);
    if (res.ok) {
      setProjects(
        projects.map((p) =>
          p.project._id === projectId ? { ...p, isArchived: isArchive } : p
        )
      );
      if (isArchive) {
        setTasks(tasks.filter((t) => t.projectId !== projectId));
      } else {
        const res = await GetTasksByProjectId(userId, projectId!, !isArchive);
        setTasks([...tasks, ...res]);
      }

      console.log("return from archive-------------", res);
      console.log("state", archived);
    }
  }
  return (
    <button onClick={() => archive(!archived)}>
      {archived ? "Restore" : "Archive"}
    </button>
  );
}
