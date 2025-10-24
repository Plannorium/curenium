
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import dbConnect from '../lib/dbConnect';
import Invite from '../models/Invite';
import Organization from '../models/Organization';
import User from '../models/User';
import bcrypt from 'bcryptjs';

(async () => {
  await dbConnect();

  let org = await Organization.findOne({ name: "Curenium Hospital" });
  if (!org) {
    org = await Organization.create({ name: "Curenium Hospital", email: "admin@curenium.com" });
    console.log('✅ Created Curenium Hospital organization');
  }

  let adminUser = await User.findOne({ email: "admin@curenium.com" });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);
    adminUser = await User.create({
      fullName: "Admin User",
      email: "admin@curenium.com",
      passwordHash,
      role: "admin",
      organizationId: org._id,
      verified: true,
    });
    console.log('✅ Created admin user');
  }

  await Invite.deleteMany({ organizationId: org._id }); // Clear existing invites for the org
  await Invite.create([
    {
      email: 'nurse@curenium.com',
      role: 'nurse',
      organizationId: org._id,
      status: 'pending',
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      invitedBy: adminUser._id,
    },
    {
      email: 'labtech@curenium.com',
      role: 'labtech',
      organizationId: org._id,
      status: 'accepted',
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      acceptedAt: new Date(),
      invitedBy: adminUser._id,
    },
  ]);
  console.log('✅ Seeded sample invites');

  process.exit();
})();