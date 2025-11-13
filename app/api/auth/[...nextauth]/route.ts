import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { createToken } from "@/app/lib/jwt"; // your JWT helper
import { NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user }) {
      try {
        await dbConnect();
        if (!user?.email) return false;

        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            password: "", // OAuth users don't have password
          });
        }

        // Create our own JWT for your API routes
        const token = createToken({ id: existingUser._id, email: existingUser.email });

        // Save the token in the session object (accessible client-side)
        (user as any).customToken = token;

        return true;
      } catch (err) {
        console.error("Google sign-in error:", err);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user && (user as any).customToken) {
        token.customToken = (user as any).customToken;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).token = (token as any).customToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
