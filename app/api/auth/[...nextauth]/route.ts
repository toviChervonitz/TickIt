// /app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // JWT callback
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Session callback
    async session({ session, token }) {
      return {
        ...session,
        accessToken: (token as JWT & { accessToken?: string }).accessToken,
      } as Session & { accessToken?: string };
    },
  },
};

const handler = NextAuth(authOptions);

// Next.js 13 App Router requires GET and POST exports
// export { handler as GET, handler as POST };
// import NextAuth, { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { JWT } from "next-auth/jwt";
// import { dbConnect } from "@/app/lib/DB";
// import User from "@/app/models/UserModel";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     /**
//      * Called whenever a user signs in (Google OAuth in this case).
//      * Use this to create the user in the DB if not already existing.
//      */
//     async signIn({ user }) {
//       try {
//         await dbConnect();

//         // Check if user already exists
//         const existingUser = await User.findOne({ email: user.email });

//         // If not, create a new one
//         if (!existingUser) {
//           await User.create({
//             name: user.name,
//             email: user.email,
//             image: user.image,
//             provider: "google",
//           });
//         }

//         return true; // allow sign in
//       } catch (error) {
//         console.error("Error saving Google user:", error);
//         return false; // reject sign in
//       }
//     },

//     /**
//      * JWT callback — runs whenever a token is created or updated
//      */
//     async jwt({ token, account }) {
//       if (account) {
//         (token as JWT & { accessToken?: string }).accessToken = account.access_token;
//       }
//       return token;
//     },

//     /**
//      * Session callback — adds the accessToken to the session
//      */
//     async session({ session, token }) {
//       return {
//         ...session,
//         accessToken: (token as JWT & { accessToken?: string }).accessToken,
//       };
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
