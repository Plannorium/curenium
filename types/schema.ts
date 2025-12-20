
export interface Nurse {
  _id: string;
  fullName: string;
  email?: string;
  role?: string;
  department?: string;
  ward?: string;
}

export interface Ward {
  _id: string;
  name: string;
  wardNumber: string;
  department: {
    _id: string;
    name: string;
  };
  totalBeds: number;
  totalRooms?: number;
  occupiedBeds: number;
  availableBeds: number;
  wardType: string;
  floor?: string;
  building?: string;
  isActive: boolean;
  chargeNurse?: {
    _id: string;
    fullName: string;
  };
  assignedNurses: Nurse[];
  createdAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedStaff?: Array<{
    _id: string;
    fullName: string;
    role: string;
    email?: string;
  }>;
  specialties?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Staff {
  _id: string;
  fullName: string;
  email?: string;
  role?: string;
  department?: string;
  ward?: string;
}