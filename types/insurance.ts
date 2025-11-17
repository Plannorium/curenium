export interface Insurance {
  _id: string;
  patientId: string;
  orgId: string;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberDob: string;
  relationshipToPatient: string;
  createdAt: string;
  updatedAt: string;
}