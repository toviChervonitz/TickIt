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
import { JWT } from "next-auth/jwt";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    /**
     * Called when a user signs in via Google
     */
    async signIn({ user }) {
      try {
        console.log("Google user info:", user);

        // Connect to DB (must be the same URI as your manual register route)
        await dbConnect();
        console.log("DB connected!");

        // Check if user exists
        const existingUser = await User.findOne({ email: user.email });
        console.log("Existing user:", existingUser);

        // Create new user if not exists
        if (!existingUser) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            password: "", // OAuth users have no password
          });
          console.log("Created new user:", newUser);
        }

        return true; // allow sign-in
      } catch (err) {
        console.error("Google sign-in DB error:", err);
        return true; // allow sign-in even if DB fails
      }
    },

    /**
     * JWT callback
     */
    async jwt({ token, account }) {
      if (account) {
        (token as JWT & { accessToken?: string }).accessToken = account.access_token;
      }
      return token;
    },

    /**
     * Session callback
     */
    async session({ session, token }) {
      return {
        ...session,
        accessToken: (token as JWT & { accessToken?: string }).accessToken,
      };
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
