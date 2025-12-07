"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Login, signInWithGoogle } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { IUserSafe } from "@/app/models/types";
import { getTranslation } from "@/app/lib/i18n";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Divider,
  Alert,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { googleLoginService } from "@/app/lib/server/googleService";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useLanguage } from "@/app/context/LanguageContext";

interface LoginResponse {
  status: "success" | "error";
  message?: string;
  user?: IUserSafe;
  token?: string;
}

export default function LoginPage() {
  const t = getTranslation();
  const router = useRouter();
  const { setUser } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("emptyFields"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await Login({ email, password });
      if (result) {
        console.log("result from login page", result);
      }
      if (result.status === 404) {
        router.push("/pages/register");
        return;
      }

      if (result.status === 401) {
        setError("Password incorrect");
        setLoading(false);
        return;
      }

      if (result.status === 200 && result.user) {
        setUser(result.user);
        router.replace("/pages/dashboard");
        return;
      }

      setError(result.message || "Login failed");
    } catch (err: any) {
      console.error(err);
      setError(t("loginFailed"));
      setLoading(false);
    }
  };

  const handleGoogleLogIn = async () => {
    if (googleLoading) return;
    setError("");
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      console.log("res user in google sign in", res);
      const idToken = await res.getIdToken();
      console.log("Firebase ID Token:", idToken);

      const userData = {
        email: res.email,
        googleId: res.uid,
        name: res.displayName,
        image: res.photoURL,
      };
      const { ok, status, data } = await googleLoginService(userData, idToken);
      console.log("status", status);
      console.log("ok", ok);
      if (!ok) {
        setGoogleLoading(false);
        if (status === 401) {
          setError("Unauthorized Google access");
        } else if (status === 400) {
          setError("Some Google user details are missing");
        } else {
          setError("Google login failed");
        }
        return;
      }
      console.log("data in google log in", data);
      setUser(data.user);
      //check if user created just now then send it to createProject page
      // if(time)
      const createdAt = new Date(data.user.createdAt); // התאריך שמתקבל מהשרת
      const now = new Date(); // הזמן הנוכחי

      const diffMs = now.getTime() - createdAt.getTime();

      const diffMinutes = diffMs / 1000 / 60;
      console.log("diffminutes", diffMinutes);

      if (Number(diffMinutes) <= 5) {
        console.log("in if of minutes");

        router.push("/pages/createProject");
      } else router.push("/pages/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error.code || error);
      setError(t("googleSignInFailed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "50vh",
        backgroundColor: "#F0EBE3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 2.5,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Card
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3dd2cc 0%, #2dbfb9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
                boxShadow: "0 4px 16px rgba(29,72,106,0.2)",
              }}
            >
              <LockOutlinedIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>

            <Typography
              variant="h4"
              fontWeight={800}
              color="primary.main"
              sx={{ mb: 1 }}
            >
              {t("welcomeBack")}
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {t("signInToContinue")}
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label={t("emailAddress")}
                type="email"
                value={email}
                onChange={handleChange(setEmail)}
                required
                autoComplete="email"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                  },
                }}
              />

              <TextField
                fullWidth
                label={t("password")}
                type="password"
                value={password}
                onChange={handleChange(setPassword)}
                required
                autoComplete="current-password"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(61,210,204,0.4)",
                  },
                  transition: "all 0.3s ease",
                  "&:disabled": {
                    background: "#9ca3af",
                    color: "white",
                  },
                }}
              >
                {loading ? t("signingIn") : t("signIn")}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {t("or")}
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleGoogleLogIn}
            disabled={googleLoading}
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              borderColor: "#e0e0e0",
              color: "#555",
              backgroundColor: "white",
              borderWidth: 2,
              "&:hover": {
                borderColor: "#1d486a",
                backgroundColor: "#fafaf9",
                borderWidth: 2,
              },
              "&:disabled": {
                borderColor: "#e0e0e0",
                color: "#9ca3af",
              },
            }}
          >
            {googleLoading ? "Connecting..." : t("continueWithGoogle")}
          </Button>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t("dontHaveAccount")}{" "}
              <MuiLink
                component={Link}
                href="/pages/register"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {t("createAccount")}
              </MuiLink>
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("forgotPassword")}{" "}
              <MuiLink
                component={Link}
                href="/pages/forgotPassword"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {t("resetHere")}
              </MuiLink>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
