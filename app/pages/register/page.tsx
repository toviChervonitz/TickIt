"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../login.css";
import { Register } from "@/app/lib/server/authServer";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    console.log("Registering:", { name, email, phone, password, image });

    try {
      const result = await Register({ name, email, tel:phone, password, image });

      if (result.status === 409) {
        setError("Email already exists");
        return;
      }

      console.log("Registration success:", result);
      router.push("/pages/createProject");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Register</h1>
        <p>Create your account</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        {image && (
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={image}
              alt="Preview"
              style={{ width: "80px", height: "80px", borderRadius: "50%" }}
            />
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
