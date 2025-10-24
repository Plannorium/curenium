import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: {  label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();
                if (!credentials) {
                  return null;
                }
                const user = await User.findOne({ email: credentials.email });

                if (user && user.passwordHash && bcrypt.compareSync(credentials.password, user.passwordHash)) {
                  if (!user.verified) {
                    throw new Error("Your account is pending verification by an administrator.");
                  }
                  return {
                    id: user._id.toString(),
                    _id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    organizationId: user.organizationId.toString(),
                    token: "dummy-token",
                  };
                }
                return null;
              }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token._id = user._id;
                token.fullName = user.fullName;
                token.role = user.role;
                token.organizationId = user.organizationId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user._id = token._id as string;
                session.user.fullName = token.fullName as string;
                session.user.role = token.role as string;
                session.user.organizationId = token.organizationId as string;
                session.user.token = token.sub;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
};