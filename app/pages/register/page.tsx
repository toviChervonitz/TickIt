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
    direction: lang === "he" ? "rtl" : "ltr", // RTL support
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
      {/* Header */}
      <Box sx={{ textAlign: lang === "he" ? "right" : "center", mb: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3dd2cc 0%, #2dbfb9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: lang === "he" ? "0 0 16px 0" : "0 auto 16px",
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
          sx={{ mb: 1, textAlign: lang === "he" ? "right" : "center" }}
        >
          {/* translation here */}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: lang === "he" ? "right" : "center" }}
        >
          {/* translation here */}
        </Typography>
      </Box>

      {/* Avatar / Upload Section */}
      <Box sx={{ textAlign: lang === "he" ? "right" : "center", mb: 3 }}>
        {/* Avatar container */}
        <Box
          sx={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <Avatar
            src={image}
            sx={{
              width: 100,
              height: 100,
              cursor: "pointer",
              border: "4px solid",
              borderColor: "primary.main",
              backgroundColor: "#f0f0f0",
              fontSize: "2.5rem",
              color: "#9ca3af",
              "&:hover": { opacity: 0.8 },
              transition: "all 0.3s ease",
            }}
            onClick={() => document.getElementById("imageInput")?.click()}
          >
            {!image && "+"}
          </Avatar>

          <IconButton
            sx={{
              position: "absolute",
              bottom: 0,
              right: lang === "he" ? "auto" : 0,
              left: lang === "he" ? 0 : "auto",
              backgroundColor: "primary.main",
              color: "white",
              width: 36,
              height: 36,
              "&:hover": { backgroundColor: "primary.dark" },
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onClick={() => document.getElementById("imageInput")?.click()}
          >
            <CameraAltIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1, textAlign: lang === "he" ? "right" : "center" }}
        >
          {/* translation here */}
        </Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2.5,
            mb: 3,
            textAlign: lang === "he" ? "right" : "left", // RTL support
          }}
        >
          {/* TextFields remain the same, RTL applied via container */}
        </Box>

        <Stack spacing={2.5} direction="column" sx={{ textAlign: lang === "he" ? "right" : "left" }}>
          <Button type="submit">{/* translation */}</Button>
        </Stack>
      </Box>
    </Card>
  </Container>
</Box>
  );
}
