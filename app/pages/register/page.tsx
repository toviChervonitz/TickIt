"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Register } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { IUserSafe } from "@/app/models/types";
import "../login.css";

// Interface for API response
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
  const [googleLoading, setGoogleLoading] = useState(false); // separate loading

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
        return;
      }

      setUser(result.user);
      router.push("/pages/createProject");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ---- Google sign-in ----
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl: "/pages/createProject" });
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

        {/* Google sign-in button */}
{/* Google Sign-In Button */}
<button
  onClick={handleGoogleSignIn}
  disabled={loading}
  style={{
    marginTop: "1rem",
    backgroundColor: "white",
    color: "#555",
    border: "1px solid #ddd",
    padding: "10px 16px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  }}
>
  {/* Google "G" Logo */}
  <svg
    width="20"
    height="20"
    viewBox="0 0 533.5 544.3"
    style={{ marginRight: "8px" }}
  >
    <path
      fill="#4285F4"
      d="M533.5 278.4c0-17.4-1.5-34.1-4.4-50.4H272v95.4h146.9c-6.4 34.7-25.5 64.1-54.4 83.9v69h87.8c51.3-47.3 80.2-116.9 80.2-198.9z"
    />
    <path
      fill="#34A853"
      d="M272 544.3c73.6 0 135.5-24.4 180.7-66.1l-87.8-69c-24.5 16.5-56 26.2-92.9 26.2-71.5 0-132-48.1-153.7-112.5H29.3v70.6C74.1 488 167.4 544.3 272 544.3z"
    />
    <path
      fill="#FBBC05"
      d="M118.3 324.1c-4.9-14.5-7.7-29.9-7.7-45.6s2.8-31.1 7.7-45.6V162H29.3c-16.1 31.5-25.3 66.8-25.3 103s9.2 71.5 25.3 103l88.9-69z"
    />
    <path
      fill="#EA4335"
      d="M272 107.6c39.8 0 75.4 13.7 103.6 40.7l77.7-77.7C407.6 24.4 345.6 0 272 0 167.4 0 74.1 56.3 29.3 162l88.9 70.5C140 155.7 200.5 107.6 272 107.6z"
    />
  </svg>

  {loading ? "Signing in..." : "Sign in with Google"}
</button>


        <p style={{ marginTop: "1rem" }}>
          Already have an account? <a href="/pages/login" style={{ color: "#0070f3" }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
