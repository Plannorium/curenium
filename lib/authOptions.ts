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
};