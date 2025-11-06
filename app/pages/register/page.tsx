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
  const [image, setImage] = useState<string>(""); // will hold object URL
  const [error, setError] = useState("");

  // Handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to object URL for preview
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    console.log("Registering:", { name, email, phone, password, image });

    try {
      const result = await Register({ name, email, tel: phone, password, image });

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

        {/* Profile picture picker */}
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

          <button type="submit">Register</button>
        </form>

        <p style={{ marginTop: "1rem" }}>
          Already have an account? <a href="/login" style={{ color: "#0070f3" }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
