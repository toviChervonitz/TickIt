// "use client";

// import React, { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import "../login.css";
// import { Register } from "@/app/lib/server/authServer";
// import useAppStore from "@/app/store/useAppStore";

// export default function RegisterPage() {
//   const router = useRouter();
//   const { setUser } = useAppStore();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [image, setImage] = useState<string>(""); // optional profile image
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Handle file selection
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     setImage(url);
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!name || !email || !phone || !password) {
//       setError("Please fill in all required fields.");
//       return;
//     }

//     setError("");
//     setLoading(true);

//     try {
//       const payload: any = {
//         name,
//         email,
//         tel: phone,
//         password,
//       };

//       if (image && !image.startsWith("blob:")) {
//         payload.image = image;
//       }

//       const result = await Register(payload);

//       if (result.status === 409) {
//         setError("Email already exists");
//         setLoading(false);
//         return;
//       }

//       // ✅ Save user to Zustand
//       setUser(result.user);

//       console.log("Registration success:", result);
//       router.push("/pages/createProject");
//     } catch (err: any) {
//       console.error("Registration error:", err);
//       setError(err.message || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         <h1>Register</h1>
//         <p>Create your account</p>

//         {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

//         {/* Profile image */}
//         <div
//           style={{
//             width: "100px",
//             height: "100px",
//             borderRadius: "50%",
//             backgroundColor: "#ddd",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             margin: "0 auto 1rem auto",
//             cursor: "pointer",
//             overflow: "hidden",
//           }}
//           onClick={() => document.getElementById("imageInput")?.click()}
//         >
//           {image ? (
//             <img
//               src={image}
//               alt="Profile"
//               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             />
//           ) : (
//             <span>+</span>
//           )}
//         </div>
//         <input
//           id="imageInput"
//           type="file"
//           accept="image/*"
//           style={{ display: "none" }}
//           onChange={handleImageChange}
//         />

//         <form className="login-form" onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="tel"
//             placeholder="Phone"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               opacity: loading ? 0.6 : 1,
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//           >
//             {loading ? "Registering..." : "Register"}
//           </button>
//         </form>

//         <p style={{ marginTop: "1rem" }}>
//           Already have an account?{" "}
//           <a href="/pages/login" style={{ color: "#0070f3" }}>
//             Log in
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../login.css";
import { Register } from "@/app/lib/server/authServer";
import useAppStore from "@/app/store/useAppStore";
import { signIn } from "next-auth/react"; // 👈 import from next-auth

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAppStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle profile image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
  };

  // Handle manual registration
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload: any = { name, email, tel: phone, password };
      if (image && !image.startsWith("blob:")) payload.image = image;

      const result = await Register(payload);

      if (result.status === 409) {
        setError("Email already exists");
        setLoading(false);
        return;
      }

      setUser(result.user);
      console.log("Registration success:", result);
      router.push("/pages/createProject");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Google Sign-In handler
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/pages/createProject" });
    } catch (err) {
      console.error("Google Sign-In error:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Register</h1>
        <p>Create your account</p>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        {/* Profile image */}
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

          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* 👇 Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            marginTop: "1rem",
            backgroundColor: "white",
            border: "1px solid #ccc",
            color: "#555",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            style={{ width: "20px", height: "20px" }}
          />
          Sign up with Google
        </button>

        <p style={{ marginTop: "1rem" }}>
          Already have an account?{" "}
          <a href="/pages/login" style={{ color: "#0070f3" }}>
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
