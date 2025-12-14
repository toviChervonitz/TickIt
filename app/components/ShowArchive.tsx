// interface ShowArchiveProps {
//   show: boolean;
//   setShowArchive: (show: boolean) => void;
// }

// export default function ShowArchive({
//   show,
//   setShowArchive,
// }: ShowArchiveProps) {
//   return <button onClick={() => setShowArchive(!show)}>
//       {show ? "Show all projects " : "Show archive"}
//     </button>;
// }

import { Button } from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import UndoIcon from "@mui/icons-material/Undo";
import { getTranslation } from "../lib/i18n";

interface ShowArchiveProps {
  show: boolean;
  setShowArchive: (show: boolean) => void;
}

export default function ShowArchive({ show, setShowArchive }: ShowArchiveProps) {
    const t = getTranslation();
  
  return (
    <Button
      variant={show ? "contained" : "outlined"}
      onClick={() => setShowArchive(!show)}
      startIcon={show ? <UndoIcon /> : <ArchiveIcon />}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        borderWidth: "1.5px",
        px: 2.5,
        py: 1,
        borderColor: "#1d486a",
        color: show ? "white" : "#1d486a",
        backgroundColor: show ? "#1d486a" : "white",
        "&:hover": {
          backgroundColor: show ? "#153852" : "#f0f2f5",
          borderColor: "#1d486a",
        },
      }}
    >
      {show ? t("showAllProjects") : t("showArchive")}
    </Button>
  );
}
