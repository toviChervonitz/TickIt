"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link from next/navigation
import "../login.css";
import { Login } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { set } from "mongoose";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    console.log("Logging in with", { email, password });

    try {
      const result = await Login({ email, password });
      if (result.status === 401 || result.status === 404 || result.status === 400) {
        console.log("Login failed:", result);
        setError("Invalid email or password.");
        return;
      }
      console.log("Login success:", result);
      setUser(result.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
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
        <h1>Log In</h1>
        <p>Enter your credentials to access your account.</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange(setEmail)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleChange(setPassword)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {/* Add the register link */}
        <p style={{ marginTop: "1rem" }}>
          Don't have an account?{" "}
          <Link href="/pages/register" style={{ color: "#0070f3" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
