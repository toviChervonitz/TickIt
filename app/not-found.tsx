"use client";

import React from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Box,
  Card,
  Container,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt"; // Icon relevant for a task management site
import { getTheme } from "@/theme/theme"; // Ensure this path is correct for your Theme file

const NotFound = () => {
  // Use English theme direction for formal presentation
  const theme = getTheme("en"); 

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 4,
          backgroundColor: theme.palette.background.default, // General background color
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 450,
            padding: { xs: 3, sm: 5 },
            // Card styling inherits from MuiCard overrides in your theme
          }}
        >
          <Box
            sx={{
              color: theme.palette.primary.main, // Deep blue
              marginBottom: 3,
            }}
          >
            <TaskAltIcon sx={{ fontSize: 80 }} /> {/* Large task icon */}
          </Box>

          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: 80, sm: 100 },
              fontWeight: 900,
              color: theme.palette.primary.main,
              lineHeight: 1,
              marginBottom: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary, // Deep blue text
              marginBottom: 2,
            }}
          >
            Task Not Found! 🧐
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary, // Mid-tone blue text
              marginBottom: 4,
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            **Error:** The requested resource could not be located. It appears
            this path is not registered in our Task Management System. Please
            verify the URL or return to the main dashboard to access your active tasks.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/pages/dashboard"
            sx={{
              boxShadow: "0 6px 16px rgba(29,72,106,0.25)", // Impressive shadow
              "&:hover": {
                // Uses the hover effect defined in your Theme
                background: "linear-gradient(to bottom, #163957, #122d42)",
              },
            }}
          >
            Return to Dashboard
          </Button>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default NotFound;