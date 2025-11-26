// authServer.ts
import { loginSchema, registerSchema } from "../validation";
import { signIn, getSession } from "next-auth/react";

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

  if (!res.ok) throw new Error(data.error || "Login failed");

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return { status: res.status, ...data };
}





import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
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

//
// import NextAuth, { NextAuthOptions, Session } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { dbConnect } from "@/app/lib/DB";
// import User from "@/app/models/UserModel";
// import { JWT } from "next-auth/jwt";

// // ---- TypeScript extension ----
// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: { params: { scope: "openid email profile" } },
//     }),
//   ],

//   session: { strategy: "jwt" },

//   callbacks: {
//     async signIn({ user }) {
//       await dbConnect();

//       const existingUser = await User.findOne({ email: user?.email });
//       if (!existingUser && user?.email) {
//         await User.create({
//           name: user.name,
//           email: user.email,
//           image: user.image,
//           provider: "google",
//           password: "", // leave blank for OAuth
//         });
//       }
//       return true;
//     },

//     async jwt({ token, account }) {
//       if (account) (token as JWT & { accessToken?: string }).accessToken = account.access_token;
//       return token;
//     },

//     async session({ session, token }) {
//       session.accessToken = (token as JWT & { accessToken?: string }).accessToken;
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// //
// /**
//  * Google Sign-In handler
//  * Opens NextAuth Google login flow and stores the token in localStorage
//  */
// export async function GoogleSignIn(callbackUrl = "/pages/createProject") {
//   // Trigger the Google sign-in
//   await signIn("google", { callbackUrl });

//   // After redirect, get the session (with the JWT)
//   const session = await getSession();
//   if (!session) throw new Error("Google sign-in failed: No session");

//   // Assuming you added the JWT to session.accessToken in your [...nextauth] callbacks
//   if (session.accessToken) {
//     localStorage.setItem("token", session.accessToken);
//   } else {
//     console.warn("Google sign-in: No accessToken found in session");
//   }

//   return session;
// }


export async function logoutService() {
  await fetch("/api/auth/logout", { method: "POST" });
  return true;
}