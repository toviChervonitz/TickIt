"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Login } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { IUserSafe } from "@/app/models/types";
import "../login.css";

interface LoginResponse {
  status: "success" | "error";
  message?: string;
  user?: IUserSafe;
  token?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  // ---- Manual login ----
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
        return;
      }
      console.log("Login success:", result);
      console.log(result.user);
      setUser(result.user);
      router.push("/pages/getAllTaskByUser");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---- Google login ----
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/pages/getAllTaskByUser" });
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Log In</h1>
        <p>Enter your credentials or use Google</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={handleChange(setEmail)} required />
          <input type="password" placeholder="Password" value={password} onChange={handleChange(setPassword)} required />
          <button type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            marginTop: "1rem",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p style={{ marginTop: "1rem" }}>
          Don’t have an account? <a href="/pages/register" style={{ color: "#0070f3" }}>Register</a>
        </p>
      </div>
    </div>
  );
}
