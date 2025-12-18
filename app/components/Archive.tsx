import { IconButton, Tooltip } from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import { toArchive } from "../lib/server/projectServer";
import { GetTasksByProjectId } from "../lib/server/taskServer";
import useAppStore from "../store/useAppStore";
import { getTranslation } from "../lib/i18n";

interface ArchiveProps {
  projectId: string | undefined;
  userId: string;
  archived: boolean;
}

export default function Archive({ projectId, archived , userId }: ArchiveProps) {
  const { projects, setProjects, setTasks, tasks } = useAppStore();
  const t = getTranslation()

  async function archive(isArchive: boolean) {
    const res = await toArchive(projectId, userId, isArchive);
    if (res.ok) {

      setProjects(
        projects.map((p) =>
          p?.project?._id === projectId ? { ...p, isArchived: isArchive } : p
        )
      );
      if (isArchive) {
        setTasks(tasks.filter((t) => t.projectId !== projectId));
      } else {
        const res = await GetTasksByProjectId(userId,projectId!, !isArchive);
        setTasks([...tasks, ...res]);
      }

      console.log("return from archive-------------", res);
      console.log("state", archived);
    }
  }

  return (
    <Tooltip
      title={archived ? "Restore project" : "Archive project"}
      placement="top"
      arrow
    >
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          archive(!archived);
        }}
        sx={{
          color: archived ? "#777" : "primary.main",
          "&:hover": {
            backgroundColor: "rgba(61,210,204,0.15)",
          },
        }}
      >
        {archived ? (
          <UnarchiveIcon fontSize="small" />
        ) : (
          <ArchiveIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
