"use client";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme/theme";
import Navbar from "./components/Navbar";
import { Box } from "@mui/material";
import RealtimeLoader from "./components/RealtimeLoader";

export default function ClientLayout({ children }: { children: React.ReactNode }) {


    return (
        <ThemeProvider theme={theme}>
            <RealtimeLoader />
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