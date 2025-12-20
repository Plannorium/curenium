/**
 * Utility functions for medication-related operations
 */

export function getFrequencyHours(frequency: string): number {
  const freq = frequency.toLowerCase();
  if (freq.includes('q4h')) return 4;
  if (freq.includes('q6h')) return 6;
  if (freq.includes('q8h')) return 8;
  if (freq.includes('q12h')) return 12;
  if (freq.includes('daily')) return 24;
  if (freq.includes('bid')) return 12;
  if (freq.includes('tid')) return 8;
  if (freq.includes('qid')) return 6;
  return 8;
}

export function calculateNextMedicationDueTime(prescription: any, frequencyHours: number, currentTime: Date): Date {
  const administrations = prescription.administrations || [];
  if (administrations.length === 0) {
    if (prescription.startDate) {
      const startDate = new Date(prescription.startDate);
      if (startDate > currentTime) return startDate;
      const hoursSinceStart = (currentTime.getTime() - startDate.getTime()) / 3600000;
      const dosesSinceStart = Math.floor(hoursSinceStart / frequencyHours);
      const nextDoseTime = new Date(startDate.getTime() + (dosesSinceStart + 1) * frequencyHours * 3600000);
      return nextDoseTime > currentTime ? nextDoseTime : new Date(currentTime.getTime() + frequencyHours * 3600000);
    }
    return currentTime;
  }
  const sortedAdmins = administrations
    .filter((admin: any) => admin.administeredAt)
    .sort((a: any, b: any) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime());
  if (sortedAdmins.length === 0) return currentTime;
  const lastAdminTime = new Date(sortedAdmins[0].administeredAt);
  const nextDueTime = new Date(lastAdminTime.getTime() + frequencyHours * 3600000);
  if (nextDueTime <= currentTime) {
    const hoursSinceLastAdmin = (currentTime.getTime() - lastAdminTime.getTime()) / 3600000;
    const missedDoses = Math.floor(hoursSinceLastAdmin / frequencyHours);
    const correctedNextDueTime = new Date(lastAdminTime.getTime() + (missedDoses + 1) * frequencyHours * 3600000);
    if (correctedNextDueTime <= currentTime) {
      return new Date(currentTime.getTime() + frequencyHours * 3600000);
    }
    return correctedNextDueTime;
  }
  return nextDueTime;
}

export function getMedicationPriority(prescription: any, dueTime: Date, now: Date): 'low' | 'medium' | 'high' | 'urgent' {
  const hoursUntilDue = (dueTime.getTime() - now.getTime()) / 3600000;
  if (hoursUntilDue < 0.5) return 'urgent';
  if (hoursUntilDue < 2) return 'high';
  return 'medium';
}