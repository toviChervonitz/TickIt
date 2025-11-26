// "use client";

// import React, { useState, FormEvent, ChangeEvent } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { Login } from "@/app/lib/server/authServer";
// import useAppStore from "@/app/store/useAppStore";
// import { IUserSafe } from "@/app/models/types";
// import {
//   Box, Container, Typography, TextField, Button, Card, Divider, Alert, Link as MuiLink, Stack
// } from "@mui/material";
// import Link from "next/link";
// import GoogleIcon from '@mui/icons-material/Google';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// interface LoginResponse {
//   status: "success" | "error";
//   message?: string;
//   user?: IUserSafe;
//   token?: string;
// }

// export default function LoginPage() {
//   const router = useRouter();
//   const { setUser } = useAppStore();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);

//   const handleChange =
//     (setter: React.Dispatch<React.SetStateAction<string>>) =>
//       (e: ChangeEvent<HTMLInputElement>) => {
//         setter(e.target.value);
//       };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!email || !password) {
//       setError("Please enter both email and password.");
//       return;
//     }

//     setError("");
//     setLoading(true);

//     try {
//       const result: LoginResponse = await Login({ email, password });

//       if (result.status === "error" || !result.user) {
//         setError(result.message || "Login failed");
//         setLoading(false);
//         return;
//       }
//       setUser(result.user);
//       router.replace("/pages/dashboard");
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Login failed");
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     setError("");
//     setGoogleLoading(true);
//     try {
//       localStorage.setItem("googleAuthMode", "login");
//       await signIn("google", {
//         callbackUrl: "/pages/postGoogleRedirect",
//         state: "login"
//       });
//     } catch (err: any) {
//       console.error(err);
//       setError("Google sign-in failed");
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "50vh",
//         backgroundColor: "#F0EBE3",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         py: 2.5,
//         position: "relative",
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//         }
//       }}
//     >
//       <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
//         <Card
//           sx={{
//             p: { xs: 3, sm: 5 },
//             borderRadius: 4,
//             boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
//           }}
//         >
//           <Box sx={{ textAlign: "center", mb: 4 }}>
//             <Box
//               sx={{
//                 width: 64,
//                 height: 64,
//                 borderRadius: "50%",
//                 background: "linear-gradient(135deg, #3dd2cc 0%, #2dbfb9 100%)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 margin: "0 auto",
//                 mb: 2,
//                 boxShadow: "0 4px 16px rgba(29,72,106,0.2)",
//               }}
//             >
//               <LockOutlinedIcon sx={{ color: "white", fontSize: 32 }} />
//             </Box>

//             <Typography
//               variant="h4"
//               fontWeight={800}
//               color="primary.main"
//               sx={{ mb: 1 }}
//             >
//               Welcome Back
//             </Typography>

//             <Typography variant="body1" color="text.secondary">
//               Sign in to continue to your account
//             </Typography>
//           </Box>

//           {error && (
//             <Alert
//               severity="error"
//               sx={{ mb: 3, borderRadius: 2 }}
//               onClose={() => setError("")}
//             >
//               {error}
//             </Alert>
//           )}

//           <Box component="form" onSubmit={handleSubmit}>
//             <Stack spacing={3}>
//               <TextField
//                 fullWidth
//                 label="Email Address"
//                 type="email"
//                 value={email}
//                 onChange={handleChange(setEmail)}
//                 required
//                 autoComplete="email"
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     backgroundColor: "#fafaf9",
//                   }
//                 }}
//               />

//               <TextField
//                 fullWidth
//                 label="Password"
//                 type="password"
//                 value={password}
//                 onChange={handleChange(setPassword)}
//                 required
//                 autoComplete="current-password"
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     backgroundColor: "#fafaf9",
//                   }
//                 }}
//               />

//               <Button
//                 type="submit"
//                 variant="contained"
//                 size="large"
//                 fullWidth
//                 disabled={loading}
//                 sx={{
//                   py: 1.5,
//                   fontSize: "1rem",
//                   fontWeight: 700,
//                   textTransform: "none",
//                   background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
//                   "&:hover": {
//                     background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
//                     transform: "translateY(-2px)",
//                     boxShadow: "0 6px 20px rgba(61,210,204,0.4)",
//                   },
//                   transition: "all 0.3s ease",
//                   "&:disabled": {
//                     background: "#9ca3af",
//                     color: "white",
//                   }
//                 }}
//               >
//                 {loading ? "Signing in..." : "Sign In"}
//               </Button>
//             </Stack>
//           </Box>

//           <Divider sx={{ my: 3 }}>
//             <Typography variant="body2" color="text.secondary" fontWeight={600}>
//               OR
//             </Typography>
//           </Divider>

//           <Button
//             variant="outlined"
//             size="large"
//             fullWidth
//             onClick={handleGoogleSignIn}
//             disabled={googleLoading}
//             startIcon={<GoogleIcon />}
//             sx={{
//               py: 1.5,
//               fontSize: "1rem",
//               fontWeight: 600,
//               textTransform: "none",
//               borderColor: "#e0e0e0",
//               color: "#555",
//               backgroundColor: "white",
//               borderWidth: 2,
//               "&:hover": {
//                 borderColor: "#1d486a",
//                 backgroundColor: "#fafaf9",
//                 borderWidth: 2,
//               },
//               "&:disabled": {
//                 borderColor: "#e0e0e0",
//                 color: "#9ca3af",
//               }
//             }}
//           >
//             {googleLoading ? "Connecting..." : "Continue with Google"}
//           </Button>
//           <Box sx={{ textAlign: "center", mt: 4 }}>
//             <Typography variant="body2" color="text.secondary">
//               Don't have an account?{" "}
//               <MuiLink
//                 component={Link}
//                 href="/pages/register"
//                 sx={{
//                   color: "primary.main",
//                   fontWeight: 700,
//                   textDecoration: "none",
//                   "&:hover": {
//                     textDecoration: "underline",
//                   }
//                 }}
//               >
//                 Create Account
//               </MuiLink>
//             </Typography>

//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               Forgot your password?{" "}
//               <MuiLink
//                 component={Link}
//                 href="/pages/forgotPassword"
//                 sx={{
//                   color: "primary.main",
//                   fontWeight: 700,
//                   textDecoration: "none",
//                   "&:hover": {
//                     textDecoration: "underline",
//                   }
//                 }}
//               >
//                 Reset it here
//               </MuiLink>
//             </Typography>
//           </Box>

//         </Card>
//       </Container>
//     </Box>
//   );
// }
"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Login } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { IUserSafe } from "@/app/models/types";
import { getTranslation } from "@/app/lib/i18n";
import {
  Box, Container, Typography, TextField, Button, Card, Divider, Alert, Link as MuiLink, Stack
} from "@mui/material";
import Link from "next/link";
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useLanguage } from "@/app/context/LanguageContext";

interface LoginResponse {
  status: "success" | "error";
  message?: string;
  user?: IUserSafe;
  token?: string;
}

export default function LoginPage() {
  const { lang } = useLanguage();
  const t = getTranslation(lang);
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
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result: LoginResponse = await Login({ email, password });

      if (result.status === "error" || !result.user) {
        setError(result.message || "Login failed");
        setLoading(false);
        return;
      }
      setUser(result.user);
      router.replace("/pages/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      localStorage.setItem("googleAuthMode", "login");
      await signIn("google", {
        callbackUrl: "/pages/postGoogleRedirect",
        state: "login"
      });
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed");
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
        }
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
                  }
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
                  }
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
                  }
                }}
              >
                {loading ? "Signing in..." : t("signIn")}
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
              }
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
                  }
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
                  }
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
