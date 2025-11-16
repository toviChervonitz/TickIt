"use client";

import { sendResetCode, verifyResetCode,updatePasswordAPI } from "@/app/lib/server/resetPasswordServer";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    if (!email) return alert("Please enter your email");
    setLoading(true);
    try {
      await sendResetCode(email);
      setStep(2);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    try {
      const data = await verifyResetCode(email, code.trim());
      if (data.success) setStep(3);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function updatePassword() {
    if (!password) return alert("Please enter a new password");

    try {
      const data = await updatePasswordAPI(email, password);
      if (data.success) {
        alert("Password updated! Please log in.");
        window.location.href = "/pages/login";
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div>
      {step === 1 && (
        <>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <button onClick={sendCode} disabled={loading}>
            {loading ? "Sending..." : "Send Code"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter Code"
          />
          <button onClick={verifyCode}>Verify Code</button>
        </>
      )}

      {step === 3 && (
        <>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New Password"
          />
          <button onClick={updatePassword}>Update Password</button>
        </>
      )}
    </div>
  );
}
