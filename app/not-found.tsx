
"use client";

import React from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Box,
  Container,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { getTheme } from "@/theme/theme";
import { getTranslation } from "./lib/i18n";
import useAppStore from "./store/useAppStore";

const NotFound = () => {
  const { language } = useAppStore();
  const t = getTranslation();
  const theme = getTheme(language);


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff", // PURE WHITE
          padding: 4,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            flexDirection: { xs: "column", md: "row" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          {/* LEFT SIDE — TEXT */}
          <Box sx={{ maxWidth: 500 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 80, md: 120 },
                fontWeight: 900,
                color: theme.palette.primary.main,
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              404
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              {t("pageNotFound")}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                marginBottom: 4,
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              {t("pageNotFoundDescription")}
            </Typography>

            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/pages/dashboard"
              sx={{
                boxShadow: "0 6px 16px rgba(29,72,106,0.25)",
                "&:hover": {
                  background: "linear-gradient(to bottom, #163957, #122d42)",
                },
              }}
            >
              {t("returnToDashboard")}
            </Button>
          </Box>

          {/* RIGHT SIDE — ICON */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
            }}
          >
            <TaskAltIcon sx={{ fontSize: { xs: 150, md: 220 } }} />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default NotFound;
