"use client";

import { InviteList } from "@/components/invites/InviteList";

export default function InvitesPage() {
  return (
    <div>
      {/* <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invites</h1>
        {role === 'admin' && (
          <ClientOnly>
            <InviteUserDialog
              isOpen={isInviteModalOpen}
              onClose={() => setIsInviteModalOpen(false)}
              onInviteCreated={handleInviteCreated}
            />
          </ClientOnly>
        )}
      </div>
      <div className="mt-8">
        <p>Invites list will be displayed here.</p>
      </div> */}
      <InviteList />
    </div>
  );
}
