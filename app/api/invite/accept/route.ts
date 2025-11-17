import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Invite from '@/models/Invite';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Channel from '@/models/Channel';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendAddedToOrgEmail } from '@/lib/resendEmail';

interface AcceptInviteRequest {
  token: string;
  fullName: string;
  password?: string;
}

interface AcceptInviteRequest {
  token: string;
  fullName: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { token, fullName, password }: AcceptInviteRequest = await req.json();

    if (!token) {
      return NextResponse.json({ message: 'Invite token is missing' }, { status: 400 });
    }

    const invite = await Invite.findOne({ token, status: 'pending' });

    if (!invite) {
      return NextResponse.json({ message: 'Invalid or expired invite token' }, { status: 400 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ message: 'Invite token has expired' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: invite.email });

    if (existingUser) {
      existingUser.organizationId = invite.organizationId;
      await existingUser.save();

      // Add user to default channels
      const defaultChannels = await Channel.find({ organizationId: invite.organizationId, isDefault: true });
      for (const channel of defaultChannels) {
        if (!channel.members.includes(existingUser._id)) {
          channel.members.push(existingUser._id);
          await channel.save();
        }
      }

      invite.status = 'accepted';
      invite.acceptedAt = new Date();
      await invite.save();

      const organization = await Organization.findById(invite.organizationId);
      if (organization) {
        await sendAddedToOrgEmail(existingUser.email, existingUser.fullName, organization.name);
      }

      return NextResponse.json({ message: 'You have been added to the new organization' });
    } else {
      if (!password) {
        return NextResponse.json({ message: 'Password is required for new users' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const organization = await Organization.findById(invite.organizationId);

      if (!organization) {
        return NextResponse.json({ message: 'Organization not found' }, { status: 400 });
      }

      const newUser = new User({
        fullName,
        email: invite.email,
        passwordHash,
        organizationId: invite.organizationId,
        role: invite.role,
        verified: !organization.requireAdminVerification,
      });

      await newUser.save();

      // Add user to default channels
      const defaultChannels = await Channel.find({ organizationId: invite.organizationId, isDefault: true });
      for (const channel of defaultChannels) {
        if (!channel.members.includes(newUser._id)) {
          channel.members.push(newUser._id);
          await channel.save();
        }
      }

      invite.status = 'accepted';
      invite.acceptedAt = new Date();
      await invite.save();

      await sendWelcomeEmail(newUser.email, newUser.fullName, organization.name);

      return NextResponse.json({ message: 'Account created successfully' });
    }
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}