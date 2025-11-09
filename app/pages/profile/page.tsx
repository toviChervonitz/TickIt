"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../login.css";
import { Register } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { UpdateUser } from "@/app/lib/server/userServer";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string>(""); // will hold object URL
  const [error, setError] = useState("");
  const { user } = useAppStore(); // assuming you also store projectId

  // Handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to object URL for preview
    const url = URL.createObjectURL(file);
    setImage(url);
  };

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Prepare updates only for filled fields
  const updates: Record<string, any> = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (password) updates.password = password;
  if (image) updates.image = image;

  if (Object.keys(updates).length === 0) {
    setError("Please fill in at least one field to update.");
    return;
  }

  setError("");
  console.log("Updating:", updates);

  try {
    const result = await UpdateUser(user?.email || "", updates);
    console.log("Updating success:", result);
    router.push("/pages/dashboard");
  } catch (err: any) {
    console.error("Updating error:", err);
    setError(err.message || "Updating failed");
  }
};


  return (
    <div className="login-page">
      <div className="login-container">
        
        <p>Please fill in the details for your account</p>

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

          <button type="submit">Update</button>
        </form>

      
      </div>
    </div>
  );
}
