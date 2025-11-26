// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { ThemeProvider, CssBaseline, Box } from "@mui/material";
// import { getTheme } from "../theme/theme";
// import Navbar from "./components/Navbar";
// import RealtimeLoader from "./components/RealtimeLoader";
// import { useLanguage } from "./context/LanguageContext";
// import { CacheProvider } from "@emotion/react";
// import createCache from "@emotion/cache";
// import rtlPlugin from "stylis-plugin-rtl";
// import { prefixer } from "stylis";

// export default function ClientLayout({ children }: { children: React.ReactNode }) {
//   const { lang } = useLanguage();

//   // ✅ All hooks at top
//   const [hydrated, setHydrated] = useState(false);

//   const cacheRtl = useMemo(
//     () =>
//       createCache({
//         key: lang === "he" ? "muirtl" : "mui",
//         stylisPlugins: lang === "he" ? [prefixer, rtlPlugin] : [],
//       }),
//     [lang]
//   );

//   const theme = useMemo(() => getTheme(lang), [lang]);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   // ✅ Only use early return for rendering
//   if (!hydrated) return null;

//   return (
//     <CacheProvider value={cacheRtl}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <RealtimeLoader />
//         <Box sx={{ display: "flex", backgroundColor: "#ffffff" }}>
//           <Navbar />
//           <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh", width: "100%" }}>
//             {children}
//           </Box>
//         </Box>
//       </ThemeProvider>
//     </CacheProvider>
//   );
// }
"use client";

import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { getTheme } from "../theme/theme";
import Navbar from "./components/Navbar";
import RealtimeLoader from "./components/RealtimeLoader";
import { useLanguage } from "./context/LanguageContext";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

// LTR cache outside component
const cacheLtr = createCache({ key: "mui" });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const [hydrated, setHydrated] = useState(false);

  const cacheRtl = useMemo(
    () =>
      createCache({
        key: "muirtl",
        stylisPlugins: [prefixer, rtlPlugin],
      }),
    []
  );

  const theme = useMemo(() => getTheme(lang), [lang]);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  return (
    <CacheProvider value={lang === "he" ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RealtimeLoader />
        <Box sx={{ display: "flex", backgroundColor: "#ffffff" }} dir={lang === "he" ? "rtl" : "ltr"}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh", width: "100%" }}>
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
