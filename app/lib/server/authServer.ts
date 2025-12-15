import { loginSchema, registerSchema } from "../validation";

export async function Register(form: any) {
  const { error } = registerSchema.validate(form);
  if (error) throw new Error(error.message);

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Registration failed");

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return { status: res.status, ...data };
}

export async function Login(form: any) {
  const { error } = loginSchema.validate(form);
  if (error) throw new Error(error.message);

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  console.log("data",data);
  console.log("res",res);
  

  if (res.status >= 500) {
    throw new Error(data.message || "Server error");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return {  ...data, status: res.status };
}



import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("result of google connect", result);
    const user = result.user;
    return user;
  } catch (error) {
    console.error(" Google sign-in error:", error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(" Sign-out error:", error);
  }
}

export async function logoutService() {
  await fetch("/api/auth/logout", { method: "POST" });
  return true;
}
