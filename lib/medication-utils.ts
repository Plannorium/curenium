/**
 * Utility functions for medication-related operations
 */

interface Prescription {
  administrations?: any[];
  startDate?: Date;
  frequency?: string;
  dose?: string;
  medication?: string;
  medications?: string[];
  route?: string;
  instructions?: string;
}

const FREQUENCY_MAP: Record<string, number> = {
  q4h: 4,
  q6h: 6,
  q8h: 8,
  q12h: 12,
  q24h: 24,
  daily: 24,
  bid: 12,
  tid: 8,
  qid: 6,
};

const DEFAULT_FREQUENCY_HOURS = 8;
const MS_PER_HOUR = 3600000;

/**
 * Converts a medication frequency string to hours between doses
 * @param frequency - Medical frequency abbreviation (e.g., 'q4h', 'bid', 'daily')
 * @returns Number of hours between doses, defaults to 8 if no match
 */
export function getFrequencyHours(frequency: string): number {
  if (!frequency || typeof frequency !== 'string') {
    return DEFAULT_FREQUENCY_HOURS;
  }
  const freq = frequency.toLowerCase();
  for (const [key, hours] of Object.entries(FREQUENCY_MAP)) {
    if (freq.includes(key)) return hours;
  }
  return DEFAULT_FREQUENCY_HOURS;
}

export function calculateNextMedicationDueTime(prescription: Prescription, frequencyHours: number, currentTime: Date): Date {
  const administrations = prescription.administrations || [];
  if (administrations.length === 0) {
    if (prescription.startDate) {
      const startDate = new Date(prescription.startDate);
      if (startDate > currentTime) return startDate;
      const hoursSinceStart = (currentTime.getTime() - startDate.getTime()) / MS_PER_HOUR;
      const dosesSinceStart = Math.floor(hoursSinceStart / frequencyHours);
      const nextDoseTime = new Date(startDate.getTime() + (dosesSinceStart + 1) * frequencyHours * MS_PER_HOUR);
      return nextDoseTime > currentTime ? nextDoseTime : new Date(currentTime.getTime() + frequencyHours * MS_PER_HOUR);
    }
    return currentTime;
  }
  const sortedAdmins = administrations
    .filter((admin: any) => admin.administeredAt)
    .sort((a: any, b: any) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime());
  if (sortedAdmins.length === 0) return currentTime;
  const lastAdminTime = new Date(sortedAdmins[0].administeredAt);
  const nextDueTime = new Date(lastAdminTime.getTime() + frequencyHours * MS_PER_HOUR);
  if (nextDueTime <= currentTime) {
    const hoursSinceLastAdmin = (currentTime.getTime() - lastAdminTime.getTime()) / MS_PER_HOUR;
    const missedDoses = Math.floor(hoursSinceLastAdmin / frequencyHours);
    const correctedNextDueTime = new Date(lastAdminTime.getTime() + (missedDoses + 1) * frequencyHours * MS_PER_HOUR);
    if (correctedNextDueTime <= currentTime) {
      return new Date(currentTime.getTime() + frequencyHours * MS_PER_HOUR);
    }
    return correctedNextDueTime;
  }
  return nextDueTime;
}

export function getMedicationPriority(prescription: Prescription, dueTime: Date, now: Date): 'medium' | 'high' | 'urgent' {
  const hoursUntilDue = (dueTime.getTime() - now.getTime()) / MS_PER_HOUR;
  if (hoursUntilDue < 0.5) return 'urgent';
  if (hoursUntilDue < 2) return 'high';
  return 'medium';
}