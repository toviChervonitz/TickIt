
"use client";

import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { getTheme } from "../theme/theme";
import Navbar from "./components/Navbar";
import RealtimeLoader from "./components/RealtimeLoader";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import useAppStore from "./store/useAppStore";

// LTR cache outside component
const cacheLtr = createCache({ key: "mui" });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { language } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  const cacheRtl = useMemo(
    () =>
      createCache({
        key: "muirtl",
        stylisPlugins: [prefixer, rtlPlugin],
      }),
    []
  );

  const theme = useMemo(() => getTheme(language), [language]);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  return (
    <CacheProvider value={language === "he" ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RealtimeLoader />
        <Box sx={{ display: "flex", backgroundColor: "#ffffff" }} dir={language === "he" ? "rtl" : "ltr"}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh", width: "100%" }}>
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
