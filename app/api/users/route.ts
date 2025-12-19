import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const roles = searchParams.getAll('role'); // Get all role parameters
  const department = searchParams.get('department');
  const ward = searchParams.get('ward');

  await dbConnect();

  try {
    const query: any = {
      organizationId: session.user.organizationId,
    };

    if (roles.length > 0) {
      query.role = { $in: roles };
    } else if (role) {
      query.role = role;
    }

    // Add department filtering if specified
    if (department) {
      query.department = department;
    }

    // Add ward filtering if specified
    if (ward) {
      query.ward = ward;
    }

    const users = await User.find(query).select('fullName image id _id role online');

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  try {
    const body = await req.json() as { fullName: string, email: string, role: string, password?: string };
    await dbConnect();

    const { password, ...userData } = body;
    let passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      ...userData,
      passwordHash,
      organizationId: session.user.organizationId,
    });

    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}