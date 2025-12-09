"use client";

import { createTheme } from "@mui/material/styles";

export const getTheme = (lang: "en" | "he" | "ar") => {
  const direction = lang === "he" || lang === "ar" ? "rtl" : "ltr";

  return createTheme({
    direction,
    palette: {
      mode: "light",
      primary: { main: "#1d486a" },
      secondary: { main: "#3dd2cc" },
      background: { default: "#F7F5F0", paper: "#ffffffff" },
      text: { primary: "#122d42", secondary: "#1d486a", },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: "18px",
            backgroundColor: "#FBFAF7",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.04)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 600 },
          containedPrimary: { "&:hover": { background: "linear-gradient(to bottom, #163957, #122d42)" } },
          outlinedPrimary: {
            borderWidth: 2,
            borderColor: "#1d486a",
            "&:hover": { backgroundColor: "rgba(29,72,106,0.06)" },
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined" },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              backgroundColor: "#ffffff",
              "& fieldset": { borderColor: "#d2d7dd" },
              "&:hover fieldset": { borderColor: "#1d486a" },
              "&.Mui-focused fieldset": { borderColor: "#1d486a", borderWidth: 2 },
            },
          },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { color: "#122d42", fontWeight: 500, "&.Mui-focused": { color: "#1d486a" } } } },
      MuiAppBar: { styleOverrides: { root: { background: "#1d486a", boxShadow: "none" } } },
      MuiToolbar: { styleOverrides: { root: { minHeight: 58 } } },
      MuiIconButton: { styleOverrides: { root: { color: "#1d486a", "&:hover": { backgroundColor: "rgba(29,72,106,0.08)" } } } },
      MuiDivider: { styleOverrides: { root: { borderColor: "#d8d8d8" } } },
      MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: "#07121a", fontSize: 12, padding: "8px 12px" } } },
      MuiTabs: { styleOverrides: { indicator: { backgroundColor: "#3dd2cc", height: 3 } } },
      MuiTab: {
        styleOverrides: {
          root: { fontWeight: 600, textTransform: "none", color: "#122d42", "&.Mui-selected": { color: "#1d486a" } },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
      MuiMenuItem: { styleOverrides: { root: { borderRadius: 6, "&:hover": { backgroundColor: "#f5f3ee" } } } },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            "&.Mui-selected": { backgroundColor: "rgba(29,72,106,0.1)", "&:hover": { backgroundColor: "rgba(29,72,106,0.15)" } },
          },
        },
      },
      MuiCheckbox: { styleOverrides: { root: { color: "#1d486a", "&.Mui-checked": { color: "#1d486a" } } } },
      MuiSwitch: {
        styleOverrides: {
          switchBase: { "&.Mui-checked": { color: "#3dd2cc" }, "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#3dd2cc" } },
        },
      },
      MuiSnackbar: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" } } },
      MuiDialog: {
        defaultProps: {
          BackdropProps: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.25)",
              backdropFilter: "blur(3px)",
            },
          },
        },
        styleOverrides: {
          paper: {
            borderRadius: 16,
            padding: "16px",
            background: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
        },
      },
    },
  });
};
