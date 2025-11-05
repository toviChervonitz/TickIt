import { loginSchema, registerSchema } from "../validation";

export async function Register(form: any) {
    const { error } = registerSchema.validate(form);
    if (error) {
        throw new Error(error.message);
    }
    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error || "Registration failed");
    }

    if (data.token) {
        localStorage.setItem("token", data.token);
    }

    return { status: res.status, ...data };
}


export async function Login(form: any) {
    const { error } = loginSchema.validate(form);
    if (error) {
        throw new Error(error.message);
    }
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Login failed");
    }

    if (data.token) {
        localStorage.setItem("token", data.token);
    }

    return { status: res.status, ...data };
}