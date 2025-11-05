"use client";
/**/
import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import "../login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    console.log("Logging in with", { email, password });
    // TODO: SEND TO LOGIN API
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
      </div>
    </div>
  );
}
