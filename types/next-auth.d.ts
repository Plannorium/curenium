import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string | null;
            _id: string;
            role: string;
            organizationId: string;
            fullName: string;
            token: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        _id: string;
        role: string;
        organizationId: string;
        fullName: string;
        token: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string | null;
        _id: string;
        role: string;
        organizationId: string;
        fullName: string;
        token: string;
    }
}