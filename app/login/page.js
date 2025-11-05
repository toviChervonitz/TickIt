"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../login.css"; 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    console.log("Logging in with", { email, password });
    //SEND TO LOGIN
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
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
