"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/app/store/useAppStore";
import { UpdateUser } from "@/app/lib/server/userServer";
import ImageUpload from "@/app/components/ImageUpload";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Alert,
  Stack,
  Avatar,
  IconButton,
  Divider,
  GridLegacy as Grid,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import SaveIcon from "@mui/icons-material/Save";
import { getTranslation } from "@/app/lib/i18n";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ProfilePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = getTranslation(lang);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setPhone(user.tel || "");
    setImage(user.image || "");
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError(t("noUser"));
      return;
    }

    const updates: Record<string, any> = {};

    if (name && name !== user.name) updates.name = name;
    if (phone && phone !== user.tel) {
      updates.tel = phone;
    }
    if (image && image !== user.image) updates.image = image;

    const anyPasswordField = currentPassword || newPassword || confirmPassword;

    if (anyPasswordField) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError(t("passwordChangeInstructions"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t("passwordMismatch"));
        return;
      }

      updates.oldPassword = currentPassword;
      updates.newPassword = newPassword;
    }

    if (Object.keys(updates).length === 0) {
      setError(t("noChangesToUpdate"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await UpdateUser(user._id, user.email, updates);
      if (result.status !== "success" || !result.user) {
        setError(result.message || t("updatingFailed"));
        setLoading(false);
        return;
      }

      setUser(result.user);
      router.push("/pages/dashboard");
    } catch (err: any) {
      console.error("Updating error:", err);
      setError(err.message || t("updatingFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main" mb={1}>
            {t("profileSettings")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
{t("manageProfile")}          </Typography>
        </Box>

        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e8eaed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Error Alert */}
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
            {/* Profile Image Section */}
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

            <Divider sx={{ my: 4 }} />

            {/* Personal Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <PersonIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {t("personalInformation")}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t("fullName")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("enterName")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fafaf9",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t("phoneNumber")}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("enterPhone")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fafaf9",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("emailAddress")}
                    value={user?.email || ""}
                    disabled
                    helperText={t("emailCannotBeChanged")}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Change Password Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <LockIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {t("changePassword")}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={3}>
                {t("leaveBlank")}
              </Typography>

              <Stack >
                <Grid container spacing={3} >
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      label={t("currentPassword")}
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t("enterCurrentPassword")}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fafaf9",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("newPassword")}
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("enterNewPassword")}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fafaf9",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("confirmNewPassword")}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("confirmNewPassword")}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#fafaf9",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/pages/dashboard")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                {t("cancel")}
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<SaveIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                  },
                  "&:disabled": {
                    background: "#9ca3af",
                    color: "white",
                  },
                }}
              >
                {loading ? t("saving") : t("saveChanges")}
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}