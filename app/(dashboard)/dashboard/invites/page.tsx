
'use client';

import { ClientOnly } from '@/components/shared/ClientOnly';
import { useRole } from '@/components/auth/RoleProvider';
import dynamic from 'next/dynamic';

const InviteUserDialog = dynamic(
  () => import('@/components/invites/InviteUserDialog').then((mod) => mod.InviteUserDialog),
  { ssr: false }
);

export default function InvitesPage() {
  const { role } = useRole();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invites</h1>
        {role === 'admin' && <ClientOnly><InviteUserDialog /></ClientOnly>}
      </div>
      <div className="mt-8">
        <p>Invites list will be displayed here.</p>
      </div>
    </div>
  );
}