// // /app/api/auth/[...nextauth]/route.ts
// import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { JWT } from "next-auth/jwt";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     // JWT callback
//     async jwt({ token, account }) {
//       if (account) {
//         token.accessToken = account.access_token;
//       }
//       return token;
//     },
//     // Session callback
//     async session({ session, token }) {
//       return {
//         ...session,
//         accessToken: (token as JWT & { accessToken?: string }).accessToken,
//       } as Session & { accessToken?: string };
//     },
//   },
// };

// const handler = NextAuth(authOptions);
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid email profile" }, // ensures we get user.email
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    /**
     * Called when a user signs in via Google
     */
    async signIn({ user, account, profile }) {
      console.log("🚀 Google sign-in triggered");
      try {
        await dbConnect();
        console.log("✅ DB connected");

        if (!user?.email) {
          console.error("❌ Google user has no email");
          return false;
        }

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          console.log("🆕 Creating new user:", user.email);
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            password: "", // leave blank for OAuth users
          });
        } else {
          console.log("✅ Existing user found:", existingUser.email);
        }

        return true; // allow sign-in
      } catch (err) {
        console.error("❌ Google sign-in error:", err);
        return false;
      }
    },

    /**
     * JWT callback — attaches Google access token
     */
    async jwt({ token, account }) {
      if (account) {
        (token as JWT & { accessToken?: string }).accessToken =
          account.access_token;
      }
      return token;
    },

    /**
     * Session callback — exposes accessToken to the client
     */
    async session({ session, token }) {
      (session as SessionWithAccessToken).accessToken = (
        token as JWT & { accessToken?: string }
      ).accessToken;
      return session;
    },
  },
};

// 👇 Extend session type for TypeScript safety
interface SessionWithAccessToken {
  accessToken?: string;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
