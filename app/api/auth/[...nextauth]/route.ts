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
  debug: process.env.NODE_ENV === 'development',
  // Ensure base URL is set correctly for production
  ...(process.env.NEXTAUTH_URL && { baseUrl: process.env.NEXTAUTH_URL }),
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Handle callbackUrl parameter from query string
      try {
        const urlObj = new URL(url, baseUrl);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');

        // If there's a callbackUrl parameter, validate and use it
        if (callbackUrl) {
          // Handle both relative and absolute URLs
          if (callbackUrl.startsWith('/')) {
            // Relative URL - ensure it's safe
            return `${baseUrl}${callbackUrl}`;
          } else {
            // Absolute URL - check if it's same origin
            try {
              const callbackUrlObj = new URL(callbackUrl);
              if (callbackUrlObj.origin === baseUrl) {
                return callbackUrl;
              }
            } catch {
              // Invalid URL, fall back to base URL
            }
          }
        }
      } catch {
        // If URL parsing fails, continue with default logice
      }

      // Default NextAuth redirect logic
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // DEBUG: indicate signIn callback reached (do not log secrets)
        console.debug('[nextauth] signIn callback', { email: user?.email, provider: account?.provider });
        await dbConnect();
        const existingUser = await User.findOne({ email: user?.email?.toLowerCase() });

        if (existingUser) {
           if (account) {
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
      } catch (error) {
        console.error('SignIn callback error:', error);
        return '/login?error=SignInError';
      }
    },
    async jwt({ token, user }) {
      // DEBUG: jwt callback entry
      console.debug('[nextauth] jwt callback - user present:', !!user, 'token id before:', token.id);
      if (user) {
        // On initial sign-in, fetch the user from the DB to get authoritative data
        await dbConnect();
        const dbUser = await User.findOne({ email: user?.email?.toLowerCase() }).lean();

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
        sub: token.id ?? undefined, // Add subject claim, which is required by jose for verification
        id: token.id ?? undefined,
        name: token.name,
        image: token.picture ?? undefined,
      }).setProtectedHeader({ alg: 'HS256' }).sign(secret);

      token.accessToken = customToken; // Attach our new signed token to the NextAuth token
      // DEBUG: created customToken (only log length, not contents)
      try { console.debug('[nextauth] created customToken length:', customToken?.length); } catch {}
      return token;
    },
    async session({ session, token }) {
      // DEBUG: session callback entry
      console.debug('[nextauth] session callback', { email: session?.user?.email, tokenId: token?.id });
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
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };