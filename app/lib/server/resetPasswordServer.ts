// lib/resetServer.ts
export async function sendResetCode(email: string) {
  
  if (!email) throw new Error("Email is required");

  const res = await fetch("/api/auth/reset/sendCode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || data.error || "Failed to send reset code");
  }

  return await res.json(); // { success: true }
}

export async function verifyResetCode(email: string, code: string) {
  if (!email || !code) throw new Error("Email and code are required");

  const res = await fetch("/api/auth/reset/verifyCode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Failed to verify code");

  return data; // { success: true }
}

export async function updatePasswordAPI(email: string, password: string) {
  if (!email || !password) throw new Error("Email and password are required");

  const res = await fetch("/api/auth/reset/updatePassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error|| "Failed to update password");

  return data; // { success: true }
}
