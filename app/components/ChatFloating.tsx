// "use client";

// import React, { useState } from "react";
// import Chat from "@/app/components/Chat";
// import ChatIcon from "@mui/icons-material/Chat";
// import CloseIcon from "@mui/icons-material/Close";
// import { IconButton, Box, Typography } from "@mui/material";
// import { Tooltip } from "@mui/material";
// import { getTranslation } from "../lib/i18n";
// import { useLanguage } from "../context/LanguageContext";

// export default function ChatFloating() {
//   const [open, setOpen] = useState(false);
//   const t=getTranslation();
//   const lang=useLanguage()
//   return (
//     <>
//       {/* Floating Icon */}
  

// {!open && (
//   <Tooltip title={t("openChat")} arrow>
// <IconButton
//   onClick={() => setOpen(true)}
//   sx={{
//     position: "fixed",
//     bottom: 24,
//     right: 24,
//     bgcolor: "#3dd2cc",
//     color: "#fff",
//     "&:hover": { bgcolor: "#2dbfb9" },
//     width: 72,
//     height: 72,
//     borderRadius: "50%",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//     zIndex: 1000,
//     "& .MuiSvgIcon-root": { 
//       fontSize: 36,
//       transform: typeof navigator !== "undefined" && navigator.language.startsWith("he") 
//         ? "scaleX(-1)" 
//         : "none",
//     },
//   }}
// >
//   <ChatIcon />
// </IconButton>
//   </Tooltip>
// )}


//       {/* Chat Popup */}
//       {open && (
//         <Box
//           sx={{
//             position: "fixed",
//             bottom: 24,
//             right: 24,
//             width: 360,
//             height: 500,
//             bgcolor: "#fff",
//             borderRadius: 3,
//             boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//             zIndex: 1000,
//           }}
//         >
//           {/* Header */}
// <Box
//   sx={{
//     p: 2,
//     bgcolor: "#3dd2cc",
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "flex-end", // aligns the X to the right
//   }}
// >
//   <IconButton
//     onClick={() => setOpen(false)}
//     sx={{ color: "#fff" }}
//     size="small"
//   >
//     <CloseIcon fontSize="small" />
//   </IconButton>
// </Box>

//           {/* Chat Content */}
//           <Box sx={{ flex: 1, overflow: "hidden" }}>
//             <Chat />
//           </Box>
//         </Box>
//       )}
//     </>
//   );
// }
"use client";

import React, { useState } from "react";
import Chat from "@/app/components/Chat";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Box, Typography, Tooltip } from "@mui/material";
import { getTranslation } from "../lib/i18n";
import { useLanguage } from "../context/LanguageContext";

export default function ChatFloating() {
  const [open, setOpen] = useState(false);
  const t = getTranslation();
  const { lang } = useLanguage(); // your current language, e.g., "he" or "en"

  return (
    <>
      {/* Floating Icon */}
      {!open && (
        <Tooltip title={t("openChat")} arrow>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              bgcolor: "#3dd2cc",
              color: "#fff",
              "&:hover": { bgcolor: "#2dbfb9" },
              width: 72,
              height: 72,
              borderRadius: "50%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              zIndex: 1000,
              "& .MuiSvgIcon-root": {
                fontSize: 36,
                transform: lang === "he" ? "scaleX(-1)" : "none", // flip for Hebrew
              },
            }}
          >
            <ChatIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Chat Popup */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 360,
            height: 500,
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#3dd2cc",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end", // aligns the X to the right
            }}
          >
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: "#fff" }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Chat Content */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Chat />
          </Box>
        </Box>
      )}
    </>
  );
}
