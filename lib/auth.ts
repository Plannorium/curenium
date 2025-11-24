const CAPABILITIES = {
  admin: ['*'],
  doctor: ['create:booking', 'read:booking', 'update:booking', 'delete:booking'],
  nurse: ['read:booking', 'update:booking'],
  patient: ['read:booking'],
};

export function hasCapability(role: string, capability: string) {
  if (!role) return false;
  if (role === 'admin') return true;
  const caps = CAPABILITIES[role] || [];
  return caps.includes(capability) || caps.includes('*');
}