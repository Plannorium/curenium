import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { authOptions as credentialsAuthOptions } from "@/lib/authOptions";

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
        token.id = user.id;
        token._id = (user as any)._id;
        token.name = (user as any).fullName;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.token = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user._id = token._id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.name = token.name || null;
        session.user.token = token.token as string;

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