import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { createToken } from "@/app/lib/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user }) {
      try {
        await dbConnect();
        if (!user?.email) return false;

        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          (user as any).customToken = createToken({
            id: existingUser._id,
            email: existingUser.email,
          });
          (user as any).isNewUser = false;
        } else {
          // Do NOT create user here; handled client-side in register flow
          (user as any).customToken = null;
          (user as any).isNewUser = true;
        }

        return true;
      } catch (err) {
        console.error("Google sign-in error:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.customToken = (user as any).customToken;
        token.isNewUser = (user as any).isNewUser || false;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).token = (token as any).customToken;
      (session as any).isNewUser = (token as any).isNewUser || false;
      (session as any).accessToken = (token as any).accessToken;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
