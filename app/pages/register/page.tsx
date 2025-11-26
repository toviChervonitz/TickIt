"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Register } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { IUserSafe } from "@/app/models/types";
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
  Avatar,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import GoogleIcon from "@mui/icons-material/Google";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { UploadButton } from "@uploadthing/react";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import ImageUpload from "@/app/components/ImageUpload";
import { getTranslation } from "@/app/lib/i18n";
import { useLanguage } from "@/app/context/LanguageContext";
interface RegisterResponse {
  status: "success" | "error";
  message?: string;
  user?: IUserSafe;
  token?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const { lang } = useLanguage();
  const t = getTranslation(lang);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        tel: phone,
        password,
        provider: "credentials",
        image,
      };
      const result: RegisterResponse = await Register(payload);

      if (result.status !== "success" || !result.user) {
        setError(result.message || "Registration failed");
        setLoading(false);
        return;
      }

      setUser(result.user);
      router.replace("/pages/createProject");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      localStorage.setItem("googleAuthMode", "register");
      await signIn("google", {
        callbackUrl: "/pages/postGoogleRedirect",
        state: "register",
      });
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  return (
    <Box
      sx={{
        minHeight: "100vh",
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
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
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
                boxShadow: "0 4px 16px rgba(61,210,204,0.3)",
              }}
            >
              <PersonAddOutlinedIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>

            <Typography
              variant="h4"
              fontWeight={800}
              color="primary.main"
              sx={{ mb: 1 }}
            >
              {t("createAccount")}
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {t("joinUs")}
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

         <Box sx={{ textAlign: "center", mb: 4 }}>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={image}
                alt={name}
                sx={{
                  width: 120,
                  height: 120,
                  cursor: "pointer",
                  border: "4px solid",
                  borderColor: "primary.main",
                  backgroundColor: "#f0f0f0",
                  fontSize: "3rem",
                  color: "#9ca3af",
                  "&:hover": {
                    opacity: 0.8,
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={() => document.getElementById("imageInput")?.click()}
              >
                {!image && name?.charAt(0).toUpperCase()}
              </Avatar>

              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "primary.main",
                  color: "white",
                  width: 40,
                  height: 40,
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                onClick={() => document.getElementById("imageInput")?.click()}
              >
                <CameraAltIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              {t("changeProfile")}
            </Typography>
          </Box>


          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2.5,
                mb: 3,
              }}
            >
              <TextField
                fullWidth
                label={t("fullName")}
                type="text"
                value={name}
                onChange={handleChange(setName)}
                required
                autoComplete="name"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                  },
                }}
              />

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
                label={t("phoneNumber")}
                type="tel"
                value={phone}
                onChange={handleChange(setPhone)}
                required
                autoComplete="tel"
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
                autoComplete="new-password"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafaf9",
                  },
                }}
              />
            </Box>

            <Stack spacing={2.5}>
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
                {loading ? t("creatingAccount") : t("createAccount")}
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
            onClick={handleGoogleSignIn}
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
            {googleLoading ? t("connecting") : t("signupWithGoogle")}
          </Button>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t("alreadyHaveAccount")}{" "}
              <MuiLink
                component={Link}
                href="/pages/login"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {t("signIn")}
              </MuiLink>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
