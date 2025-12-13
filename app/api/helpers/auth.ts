import { authOptions } from '@/lib/authOptions';
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { NextRequest } from "next/server";

interface AuthenticatedUser {
  id: string;
  role: string;
  organizationId: string;
  email?: string;
  fullName?: string;
}

export async function authenticateUser(request: NextRequest, userId?: string): Promise<AuthenticatedUser | null> {
  try {
    // First try NextAuth session (for web clients)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      if (userId && session.user.id !== userId) {
        return null;
      }
      return {
        id: session.user.id,
        role: session.user.role || 'user',
        organizationId: session.user.organizationId || '',
        email: session.user.email || undefined,
        fullName: session.user.name || undefined,
      };
    }

    // If no session, try JWT token (for mobile clients)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        if (decoded.userId) {
          if (userId && decoded.userId !== userId) {
            return null;
          }
          // Verify user still exists and is active
          await dbConnect();
          const user = await User.findById(decoded.userId).select('role organizationId email fullName verified');
          if (user && user.verified) {
            return {
              id: user._id.toString(),
              role: user.role,
              organizationId: user.organizationId?.toString() || '',
              email: user.email,
              fullName: user.fullName,
            };
          }
        }
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}