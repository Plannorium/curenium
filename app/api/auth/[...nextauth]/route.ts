import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

import { authOptions as credentialsAuthOptions } from "@/lib/authOptions"; 
import { SignJWT } from 'jose';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    ...credentialsAuthOptions.providers,
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        if (account && !existingUser.provider) {
          existingUser.provider = account.provider;
          existingUser.providerAccountId = account.providerAccountId;
          await existingUser.save();
        }
        return true;
      }

      if (account?.provider !== 'credentials') {
        // For OAuth sign-ins, we don't create a new user here.
        // The user must be invited first.
        return '/login?error=OAuthUserNotFound';
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // On initial sign-in, fetch the user from the DB to get authoritative data
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email }).lean();

        if (dbUser) {
          token.id = dbUser._id.toString();
          token._id = dbUser._id.toString();
          token.name = dbUser.fullName;
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId?.toString();
          token.picture = dbUser.image;
        }
      }

      // Create a *new*, signed JWS token for the Cloudflare Worker
      // This is separate from NextAuth's own session token.
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
      const customToken = await new SignJWT({
        id: token.id,
        name: token.name,
        image: token.picture,
      }).setProtectedHeader({ alg: 'HS256' }).sign(secret);

      token.accessToken = customToken; // Attach our new signed token to the NextAuth token
      return token;
    },
    async session({ session, token }) {
      // The session callback receives the token from the jwt callback.
      // Now, we can add the data to the client-side session object.
      if (session.user) {
        session.user.id = token.id as string;
        session.user._id = token._id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.token = token.accessToken as string; // Pass the full encoded JWT to the client

        if (!session.user.name && session.user.id) {
          try {
            await dbConnect();
            const userDb = await User.findById(session.user._id).select('fullName').lean();
            if (userDb?.fullName) {
              session.user.name = userDb.fullName;
            }
          } catch (error) {
            console.error('Error fetching user name:', error);
          }
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };