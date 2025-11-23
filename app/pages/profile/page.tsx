"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAppStore from "@/app/store/useAppStore";
import { UpdateUser } from "@/app/lib/server/userServer";
import ImageUpload from "@/app/components/ImageUpload";

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setPhone(user.tel || "");
    setImage(user.image || "");
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("No user in session. Please log in again.");
      return;
    }

    const updates: Record<string, any> = {};

    if (name && name !== user.name) updates.name = name;
    if (phone && phone !== user.tel) {
      updates.tel = phone;
    }
    if (image && image !== user.image) updates.image = image;

    const anyPasswordField = currentPassword || newPassword || confirmPassword;

    if (anyPasswordField) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("To change password, fill current, new and confirm password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation do not match.");
        return;
      }

      updates.oldPassword = currentPassword;
      updates.newPassword = newPassword;
    }

    if (Object.keys(updates).length === 0) {
      setError("No changes to update.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await UpdateUser(user._id, user.email, updates);
      if (result.status !== "success" || !result.user) {
        setError(result.message || "Updating failed");
        setLoading(false);
        return;
      }

      setUser(result.user);
      router.push("/pages/dashboard");
    } catch (err: any) {
      console.error("Updating error:", err);
      setError(err.message || "Updating failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <p>Please fill in the details for your account</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

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
   
        <ImageUpload onUpload={setImage} />
        
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <hr style={{ margin: "1rem 0" }} />

          <p>Change password (optional):</p>

          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
