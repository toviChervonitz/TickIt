"use client";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Stack,
  Avatar,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ShieldOutlined as ShieldIcon,
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ROUTES } from "../config/routes";

export default function UnauthorizedPage() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(circle at top left, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 45%),
          radial-gradient(circle at bottom right, ${alpha(theme.palette.primary.main, 0.12)}, transparent 45%),
          ${theme.palette.background.default}
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.2) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, px: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: 4,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <Box sx={{ position: "relative", mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              }}
            >
              <ShieldIcon sx={{ fontSize: 64, color: "white" }} />
            </Avatar>

            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: "25%",
                width: 42,
                height: 42,
                bgcolor: alpha(theme.palette.secondary.main, 0.25),
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: "25%",
                width: 28,
                height: 28,
                bgcolor: alpha(theme.palette.primary.main, 0.25),
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
                animationDelay: "700ms",
              }}
            />
          </Box>

          <Chip
            label="403 · RESTRICTED"
            size="small"
            sx={{
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Access Restricted
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 1,
              lineHeight: 1.6,
            }}
          >
            You don’t have permission to access this area.
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: alpha(theme.palette.text.primary, 0.6), mb: 4 }}
          >
            Permissions are managed by project roles.
          </Typography>

          <Box
            sx={{
              width: 88,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: 2,
              mx: "auto",
              mb: 4,
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 5 }}
          >
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(ROUTES.LANDING)}
            >
              Back to TickIt
            </Button>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ color: alpha(theme.palette.text.primary, 0.55) }}
          >
            <LockIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">
              Secure role-based access
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </Box>
  );
}
