import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Organization from "@/models/Organization";

interface AdminRegisterRequest {
    fullName: string;
    email: string;
    password: string;
    organizationName: string;
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { fullName, email, password, organizationName }: AdminRegisterRequest = await req.json();

        if (!fullName || !email || !password || !organizationName) {
            return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            console.log("Attempt to register with existing email:", email);
            return new Response(JSON.stringify({ message: "User with this email already exists" }), { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const org = await Organization.create({
            name: organizationName,
            email,
        });

        const user = await User.create({
            fullName,
            email,
            passwordHash,
            role: "admin",
            organizationId: org._id,
            verified: true,
        });

        org.createdBy = user._id;
        org.members.push(user._id);
        await org.save();

        return NextResponse.json({
            message: "Organization and admin created successfully",
            user: {
                email: user.email,
                password,
            },
        });

    } catch (error) {
        console.error("[REGISTER_ADMIN_ERROR]", error);
        return new Response(JSON.stringify({ message: "An error occurred during registration." }), { status: 500 });
    }
}