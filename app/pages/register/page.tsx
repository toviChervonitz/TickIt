"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../login.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    console.log({ name, email, phone, password, image });
    // TODO: Send data to backend register endpoint
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // preview
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Register</h1>
        <p>Create your account</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        {/* Profile image picker */}
        <label className="profile-image-wrapper">
          {image ? (
            <img src={image} alt="Profile" />
          ) : (
            <span>Pick a profile picture</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

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
      </div>
    </div>
  );
}
