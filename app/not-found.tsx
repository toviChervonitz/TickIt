"use client";

import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";
import { getTranslation } from "./lib/i18n";

export default function NotFound() {
  const t=getTranslation()
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#FBFAF7", 
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 150, md: 190 },
          fontWeight: 900,
          color: "#1d486a",
          marginBottom: 2,
        }}
      >
        404
      </Typography>

      <Typography
        sx={{
          fontSize: { xs: 22, md: 28 },
          fontWeight: 600,
          color: "#1d486a",
          marginBottom: 1,
        }}
      >
        {t("pageNotFound")}
      </Typography>

      <Typography
        sx={{
          fontSize: 16,
          color: "#5b6f7c",
          maxWidth: 420,
          marginBottom: 4,
          lineHeight: 1.6,
        }}
      >
{t("pageNotFoundDescription")}      </Typography>

      <Button
        variant="contained"
        component={Link}
        href="/pages/dashboard"
        sx={{
          backgroundColor: "#1d486a",
          padding: "12px 32px",
          borderRadius: 3,
          fontWeight: 600,
          fontSize: 16,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#153852",
          },
        }}
      >
{t("returnToDashboard")}      </Button>
    </Box>
  );
}
