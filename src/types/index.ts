export type UserRole = 
  | 'super_admin' 
  | 'state_admin' 
  | 'lmo' 
  | 'gatc' 
  | 'business_owner' 
  | 'public';

export type UserStatus = 'active' | 'pending_approval' | 'suspended';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  stateId?: string;
  stateName?: string;
  stateCode?: string;
  district?: string;
  address?: string;
  employeeId?: string;
  designation?: string;
  gatcName?: string;
  registrationNumber?: string;
  businessName?: string;
  gstin?: string;
  tradeLicense?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface StateMaster {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  districtsCount?: number;
}

export interface DistrictMaster {
  id: string;
  stateId: string;
  name: string;
  isActive: boolean;
}

export type InstrumentType = 
  | 'weighing_scale' 
  | 'measuring_instrument' 
  | 'weight' 
  | 'measure';

export type InstrumentStatus = 'active' | 'inactive' | 'condemned';

export interface Instrument {
  id: string;
  businessId: string;
  businessName: string;
  ownerName: string;
  instrumentType: InstrumentType;
  category: string;
  make: string;
  model: string;
  serialNumber: string;
  capacity: string;
  leastCount: string;
  locationOfUse: string;
  installationDate?: string;
  photoUrl?: string;
  status: InstrumentStatus;
  lastVerificationDate?: string;
  validUntil?: string;
  hasPendingApplication?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationType = 'new_verification' | 're_verification';

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'assigned' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected';

export interface Application {
  id: string;
  applicationNumber: string;
  instrumentId: string;
  instrument?: Instrument;
  businessId: string;
  businessName: string;
  applicantUserId: string;
  applicantName: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  priority: 'normal' | 'urgent';
  assignedToUserId?: string;
  assignedToName?: string;
  assignedToType?: 'lmo' | 'gatc';
  stateId: string;
  district: string;
  feeAmount: number;
  feePaid: boolean;
  paymentReference?: string;
  notes?: string;
  submittedAt?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationSchedule {
  id: string;
  applicationId: string;
  verifierUserId: string;
  verifierName: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  actualDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location: string;
  notes?: string;
  createdAt: string;
}

export interface TestObservationReading {
  parameter: string;
  standardValue: string;
  observedValue: string;
  tolerance: string;
  status: 'pass' | 'fail';
}

export interface VerificationResult {
  id: string;
  applicationId: string;
  verifierUserId: string;
  verifierName: string;
  verifierRole: 'lmo' | 'gatc';
  instrumentId: string;
  verificationDate: string;
  testObservations: TestObservationReading[];
  result: 'pass' | 'fail' | 'conditional_pass';
  remarks?: string;
  defectsFound?: string;
  correctiveAction?: string;
  photos: string[];
  verifierSignatureUrl?: string;
  verifierSealNumber?: string;
  createdAt: string;
}

export type CertificateStatus = 'active' | 'expired' | 'revoked' | 'superseded';

export interface Certificate {
  id: string;
  certificateNumber: string;
  applicationId: string;
  instrumentId: string;
  businessId: string;
  businessName: string;
  businessAddress: string;
  gstin?: string;
  instrumentMake: string;
  instrumentModel: string;
  serialNumber: string;
  instrumentType: string;
  capacity: string;
  leastCount: string;
  locationOfUse: string;
  issuedByUserId: string;
  issuedByName: string;
  issuedByDesignation: string;
  issuedByRole: 'lmo' | 'gatc';
  sealNumber: string;
  issueDate: string;
  validFrom: string;
  validUntil: string;
  qrCodeData: string;
  qrCodeUrl?: string;
  certificatePdfUrl?: string;
  status: CertificateStatus;
  revocationReason?: string;
  revokedAt?: string;
  verificationToken: string;
  sha256Hash: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'verification_due' | 'application_update' | 'certificate_issued' | 'system_alert';
  isRead: boolean;
  relatedEntityType?: 'application' | 'instrument' | 'certificate';
  relatedEntityId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  stateCode?: string;
  createdAt: string;
}

export interface FeeStructure {
  id: string;
  instrumentType: InstrumentType;
  category: string;
  verificationType: ApplicationType;
  feeAmount: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  stateId?: string;
}

export interface Grievance {
  id: string;
  complaintNumber: string;
  complainantName: string;
  complainantPhone: string;
  complainantEmail?: string;
  targetBusinessName: string;
  targetAddress: string;
  district: string;
  stateName: string;
  category: 'tampered_scale' | 'missing_stamp' | 'overcharging' | 'officer_misconduct' | 'other';
  description: string;
  status: 'pending' | 'under_investigation' | 'resolved' | 'rejected';
  assignedLmoId?: string;
  resolutionNotes?: string;
  createdAt: string;
}
