"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Register } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { IUserSafe } from "@/app/models/types";
import "../login.css";

interface RegisterResponse {
  status: "success" | "error";
  message?: string;
  user?: IUserSafe;
  token?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAppStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Image upload ----
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  // ---- Manual registration ----
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = { name, email, tel: phone, password, provider: "credentials", image };
      const result: RegisterResponse = await Register(payload);

      if (result.status !== "success" || !result.user) {
        setError(result.message || "Registration failed");
        setLoading(false);
        return;
      }

      // ✅ Save safe user to Zustand
      setUser(result.user);
      router.push("/pages/createProject");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ---- Google registration/sign-in ----
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/pages/createProject" });
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Register</h1>
        <p>Create your account</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        {/* Profile image */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          {image ? (
            <img
              src={image}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>+</span>
          )}
        </div>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        {/* Manual registration form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" value={name} onChange={handleChange(setName)} required />
          <input type="email" placeholder="Email" value={email} onChange={handleChange(setEmail)} required />
          <input type="tel" placeholder="Phone" value={phone} onChange={handleChange(setPhone)} required />
          <input type="password" placeholder="Password" value={password} onChange={handleChange(setPassword)} required />
          <button type="submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Google button */}
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
          {loading ? "Signing in..." : "Sign up with Google"}
        </button>

        <p style={{ marginTop: "1rem" }}>
          Already have an account? <a href="/pages/login" style={{ color: "#0070f3" }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
