"use client";

import { sendResetCode, verifyResetCode, updatePasswordAPI } from "@/app/lib/server/resetPasswordServer";
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getTranslation } from "@/app/lib/i18n";

export default function ForgotPasswordPage() {
  const t = getTranslation();
  const steps = [t("enterEmail"), t("verifyCode"), t("resetPassword")];

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    if (!email) {
      setError(t("pleaseEnterEmail"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendResetCode(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || t("codeSendFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!code.trim()) {
      setError(t("EnterVerificationCode"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await verifyResetCode(email, code.trim());
      if (data.success) setStep(3);
    } catch (err: any) {
      setError(err.message || t("invalidCode"));
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    if (!password) {
      setError(t("failedEnterNewPassword"));
      return;
    }
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await updatePasswordAPI(email, password);
      if (data.success) {
        window.location.href = "/pages/login";
      }
    } catch (err: any) {
      setError(err.message || t("failedToUpdatePassword"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "50vh",
        background: "linear-gradient(135deg, #f0ebe3 0%, #e8e2d9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            background: "linear-gradient(180deg, #ffffff 0%, #fdfcfa 100%)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1d486a 0%, #122d42 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
                boxShadow: "0 4px 16px rgba(29,72,106,0.2)",
              }}
            >
              <LockResetIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>

            <Typography variant="h4" fontWeight={800} color="primary.main" mb={1}>
              {t("resetPassword")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("followAccountSteps")}
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={step - 1} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        "&.Mui-active": {
                          color: "#3dd2cc",
                        },
                        "&.Mui-completed": {
                          color: "#3dd2cc",
                        },
                      },
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <EmailIcon sx={{ color: "primary.main", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {t("enterEmail")}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {t("weSendCode")}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={t("emailAddress")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                  },
                }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={sendCode}
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                  },
                }}
              >
                {loading ? t("sending") : t("sendCode")}
              </Button>
            </Stack>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <VpnKeyIcon sx={{ color: "primary.main", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {t("verifyCode")}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {t("enter6code")} <strong>{email}</strong>
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={t("verificationCode")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                inputProps={{ maxLength: 6 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                    fontSize: "1.2rem",
                    letterSpacing: "0.5em",
                    textAlign: "center",
                  },
                }}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setStep(1)}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  {t("back")}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={verifyCode}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                    "&:hover": {
                      background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                    },
                  }}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CheckCircleIcon sx={{ color: "#3dd2cc", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    Create New Password
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Choose a strong password for your account.
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                helperText="Password must be at least 6 characters"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                  },
                }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={updatePassword}
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                  },
                }}
              >
                {loading ? t("updating") : t("updatePassword")}
              </Button>
            </Stack>
          )}
        </Card>
      </Container>
    </Box>
  );
}