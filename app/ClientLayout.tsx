"use client";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";
import Navbar from "./components/Navbar";
import { Box } from "@mui/material";
import useAppStore from "./store/useAppStore";
import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {

    const initRealtime = useAppStore((state) => state.initRealtime);

    useEffect(() => {
        initRealtime();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex", backgroundColor: "#ffffff", }}>
                <Navbar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minHeight: "100vh",
                        width: "100%",
                        // p: 3,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
}