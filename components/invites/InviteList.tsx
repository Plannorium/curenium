'use client';

import React, { useState, useEffect } from 'react';
import { InviteModal } from './InviteModal';
import { InviteActions } from './InviteActions';
import { Button } from '@/components/ui/button';
import { Users, Plus, Mail, Shield, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRole } from '@/components/auth/RoleProvider';

interface Invite {
  _id: string;
  email?: string;
  role?: string;
  status?: string;
  expiresAt?: string | null;
}

export const InviteList: React.FC = () => {
  const { data: session } = useSession();
  const { role: userRole } = useRole();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvites = async () => {
      if (!session?.user?.organizationId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/invites?organizationId=${session.user.organizationId}`);
        const data = (await response.json()) as { invites: Invite[] };
        if (response.ok && Array.isArray(data.invites)) {
          // Normalize: ensure we only keep valid objects
          setInvites(data.invites.filter((inv: any): inv is Invite => !!inv && typeof inv === 'object' && !!inv._id));
        } else {
          setInvites([]);
        }
      } catch (error) {
        console.error('Failed to fetch invites:', error);
        setInvites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvites();
  }, [session]);

  // Handle new invite creation
  const handleInviteCreated = (newInvite: Invite) => {
    setInvites((prevInvites) => [...prevInvites, newInvite]);
    setIsModalOpen(false);
  };

  // Placeholder for getRoleIcon function (replace with actual implementation)
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      default:
        return <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
    }
  };

  // Placeholder for getStatusColor function (replace with actual implementation)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Filter valid invites
  const validInvites = invites.filter((inv): inv is Invite => !!inv && typeof inv === 'object' && !!inv._id);

  if (validInvites.length !== invites.length) {
    console.warn('[InviteList] Skipping malformed invite entries', {
      originalLength: invites.length,
      validLength: validInvites.length,
      invites,
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/50 dark:to-primary-900/30 border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Team Invitations</h2>
              <p className="text-sm text-muted-foreground">Manage and track user invitations</p>
            </div>
          </div>
          {userRole === 'admin' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden md:block">
              Invite User
              </span>
            </Button>
          )}
        </div>
      </div>

      {userRole === 'admin' && (
        <InviteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onInviteCreated={handleInviteCreated} />
      )}

      {/* Invites List */}
      <div className="p-6 bg-card/80 dark:bg-gray-900/70 border-border/50 dark:border-gray-700/50 ">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : validInvites.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No invitations yet</h3>
            <p className="text-muted-foreground mb-6">Start building your team by sending your first invitation.</p>
            {userRole === 'admin' && (
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950/30 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Send First Invite
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {validInvites.map((invite) => {
              const role = invite?.role ?? 'staff';
              const status = invite?.status ?? 'pending';
              return (
                <div
                  key={invite._id}
                  className="group bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-primary-50 dark:bg-primary-950/30 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                        {getRoleIcon(role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-foreground truncate">{invite?.email ?? '—'}</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                          >
                            {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                          {invite?.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(invite.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <div className="flex-shrink-0 ml-4">
                        <InviteActions invite={{ _id: invite._id, status: status, email: invite?.email ?? '' }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};