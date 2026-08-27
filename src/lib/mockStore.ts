import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  UserRole,
  UserStatus,
  Instrument,
  Application,
  Certificate,
  NotificationItem,
  AuditLog,
  Grievance,
  FeeStructure,
} from "@/types";
import {
  MOCK_USERS,
  MOCK_INSTRUMENTS,
  MOCK_APPLICATIONS,
  MOCK_CERTIFICATES,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_GRIEVANCES,
  MOCK_FEES,
} from "./mockData";
import { INDIAN_STATES, STANDARD_FEE_RATES } from "./constants";
import { generateSealNumber, generateVerificationToken, generateCryptoHash, getDaysUntilExpiry } from "./utils";

export interface MockStoreState {
  currentUser: User | null;
  users: User[];
  instruments: Instrument[];
  applications: Application[];
  certificates: Certificate[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  grievances: Grievance[];
  feeStructures: FeeStructure[];
  states: typeof INDIAN_STATES;
  isLoading: boolean;

  // Auth & Session
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string) => { success: boolean; user?: User; error?: string };
  logout: () => void;

  // Business & Trader Approvals
  registerBusiness: (data: {
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    businessType?: string;
    gstin?: string;
    tradeLicenseNumber?: string;
    address: string;
    city: string;
    stateId?: string;
    stateName?: string;
    stateCode?: string;
    district: string;
    pincode?: string;
  }) => User;
  approveTrader: (userId: string) => void;
  rejectTrader: (userId: string, reason: string) => void;

  // Instruments
  addInstrument: (data: Partial<Instrument>) => Instrument;
  updateInstrument: (id: string, data: Partial<Instrument>) => void;
  bulkAddInstruments: (list: Partial<Instrument>[]) => Instrument[];

  // Applications & Scheduling
  createApplication: (data: {
    instrumentId: string;
    applicationType: "new_verification" | "re_verification";
    priority: "normal" | "urgent";
    preferredDate?: string;
    notes?: string;
  }) => Application;
  payApplicationFee: (appId: string, reference?: string) => void;
  assignApplication: (appId: string, officerId: string, officerName: string, officerType?: "lmo" | "gatc") => void;
  scheduleApplication: (appId: string, scheduledDate: string, scheduledTimeSlot: string) => void;

  // Inspection & Certification
  conductVerification: (
    appIdOrPayload: string | any,
    payload?: {
      result: "pass" | "fail" | "conditional";
      readings?: any[];
      testObservations?: any;
      remarks?: string;
      sealNumber?: string;
      verifierSealNumber?: string;
      defectsFound?: string;
      correctiveAction?: string;
      signature?: string;
      photos?: string[];
      inspectorName?: string;
      inspectorDesignation?: string;
    }
  ) => { success: boolean; certificate?: Certificate; application?: Application };
  revokeCertificate: (certId: string, reason: string) => void;

  // Officers & Administration
  addUser: (data: any) => User;
  toggleUserStatus: (userId: string, status?: UserStatus) => void;
  addOfficer: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: "lmo" | "gatc" | "state_admin";
    designation: string;
    stateId?: string;
    stateName?: string;
    district?: string;
    employeeId?: string;
    gatcName?: string;
    registrationNumber?: string;
  }) => User;
  toggleOfficerStatus: (userId: string, status?: UserStatus) => void;

  // Grievances & Logs
  addGrievance: (data: any) => Grievance;
  submitGrievance: (data: {
    complainantName: string;
    complainantPhone: string;
    complainantEmail?: string;
    targetBusinessName: string;
    targetAddress: string;
    district: string;
    stateName: string;
    category: Grievance["category"];
    description: string;
  }) => Grievance;
  updateGrievance: (id: string, dataOrStatus: any, notes?: string) => void;
  addAuditLog: (log: any) => void;
  addNotification: (notif: any) => void;

  // Master Data Fees
  updateFee: (id: string, feeAmount: number) => void;
  addFee: (data: Partial<FeeStructure>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Search & Reports
  globalSearch: (query: string) => {
    certificates: Certificate[];
    instruments: Instrument[];
    applications: Application[];
    businesses: User[];
  };
  searchAll: (query: string) => {
    instruments: Instrument[];
    applications: Application[];
    certificates: Certificate[];
    grievances: Grievance[];
    users: User[];
  };
  getDashboardStats: (role?: UserRole, user?: User | null) => any;
  resetToDefaults: () => void;
}

export const useMockStore = create<MockStoreState>()(
  persist(
    (set, get) => ({
      currentUser: MOCK_USERS[6], // Default to Business Owner (Ramesh Patel)
      users: MOCK_USERS,
      instruments: MOCK_INSTRUMENTS,
      applications: MOCK_APPLICATIONS,
      certificates: MOCK_CERTIFICATES,
      notifications: MOCK_NOTIFICATIONS,
      auditLogs: MOCK_AUDIT_LOGS,
      grievances: MOCK_GRIEVANCES,
      feeStructures: MOCK_FEES,
      states: INDIAN_STATES,
      isLoading: false,

      setUser: (user: User) => {
        set({ currentUser: user });
      },

      switchRole: (role: UserRole) => {
        const found = get().users.find((u) => u.role === role) || MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
        set({ currentUser: found });
      },

      login: (email: string, password?: string) => {
        const users = get().users;
        const normalized = email.trim().toLowerCase();
        const user = users.find((u) => u.email.toLowerCase() === normalized);

        if (user) {
          set({ currentUser: user });
          return { success: true, user };
        }

        // Fallback: Check role shortcuts in email
        if (normalized.includes("admin") || normalized.includes("doca")) {
          const u = users.find((x) => x.role === "super_admin") || MOCK_USERS[0];
          set({ currentUser: u });
          return { success: true, user: u };
        }
        if (normalized.includes("state") || normalized.includes("controller")) {
          const u = users.find((x) => x.role === "state_admin") || MOCK_USERS[1];
          set({ currentUser: u });
          return { success: true, user: u };
        }
        if (normalized.includes("lmo") || normalized.includes("inspector")) {
          const u = users.find((x) => x.role === "lmo") || MOCK_USERS[3];
          set({ currentUser: u });
          return { success: true, user: u };
        }
        if (normalized.includes("gatc") || normalized.includes("lab")) {
          const u = users.find((x) => x.role === "gatc") || MOCK_USERS[5];
          set({ currentUser: u });
          return { success: true, user: u };
        }
        if (normalized.includes("business") || normalized.includes("trader") || normalized.includes("supermarket")) {
          const u = users.find((x) => x.role === "business_owner") || MOCK_USERS[6];
          set({ currentUser: u });
          return { success: true, user: u };
        }

        return { success: false, error: "Invalid credentials. Please select a valid persona or register." };
      },

      logout: () => {
        set({ currentUser: null });
      },

      registerBusiness: (data) => {
        const newId = `usr-biz-${Date.now()}`;
        const newUser: User = {
          id: newId,
          email: data.email,
          phone: data.phone.replace(/[^0-9]/g, "").slice(-10),
          fullName: data.fullName,
          role: "business_owner",
          status: "pending_approval",
          businessName: data.businessName,
          gstin: data.gstin || "27AAACB" + Math.floor(1000 + Math.random() * 9000) + "A1Z5",
          stateId: data.stateId || "s-mh",
          stateName: data.stateName || "Maharashtra",
          district: data.district || "Pune",
          address: data.address,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: newId,
          userName: data.fullName,
          userRole: "Business Owner",
          action: "TRADER_REGISTRATION_SUBMITTED",
          entityType: "Business",
          entityId: newId,
          details: `Registered business ${data.businessName} (GSTIN: ${newUser.gstin}) awaiting State Admin approval.`,
          ipAddress: "122.176.44.19",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: "usr-state-mh",
          title: "New Trader Registration for Approval",
          message: `${data.businessName} (${data.fullName}) submitted business onboarding documents for verification.`,
          type: "application_update",
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [newUser, ...state.users],
          auditLogs: [newLog, ...state.auditLogs],
          notifications: [notif, ...state.notifications],
        }));

        return newUser;
      },

      approveTrader: (userId: string) => {
        set((state) => {
          const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, status: "active" as const } : u));
          const target = state.users.find((u) => u.id === userId);
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: state.currentUser?.id || "usr-state-mh",
            userName: state.currentUser?.fullName || "State Controller",
            userRole: "State Admin",
            action: "APPROVE_TRADER",
            entityType: "Business",
            entityId: userId,
            details: `Approved trader account for ${target?.businessName || target?.fullName}. Account is now fully active.`,
            ipAddress: "14.139.120.2",
            stateCode: "MH",
            createdAt: new Date().toISOString(),
          };
          const notif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId,
            title: "Business Account Approved",
            message: "Your Legal Metrology trader account has been reviewed & approved by the State Controller. You can now register instruments and apply for verification.",
            type: "application_update",
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          return {
            users: updatedUsers,
            auditLogs: [newLog, ...state.auditLogs],
            notifications: [notif, ...state.notifications],
          };
        });
      },

      rejectTrader: (userId: string, reason: string) => {
        set((state) => {
          const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, status: "suspended" as const } : u));
          const target = state.users.find((u) => u.id === userId);
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: state.currentUser?.id || "usr-state-mh",
            userName: state.currentUser?.fullName || "State Controller",
            userRole: "State Admin",
            action: "REJECT_TRADER",
            entityType: "Business",
            entityId: userId,
            details: `Rejected trader registration for ${target?.businessName || "Trader"}: ${reason}`,
            ipAddress: "14.139.120.2",
            stateCode: "MH",
            createdAt: new Date().toISOString(),
          };
          return {
            users: updatedUsers,
            auditLogs: [newLog, ...state.auditLogs],
          };
        });
      },

      addInstrument: (data) => {
        const user = get().currentUser;
        const newInst: Instrument = {
          id: `inst-${Date.now()}`,
          businessId: data.businessId || user?.id || "usr-biz-01",
          businessName: data.businessName || user?.businessName || "Commercial Establishment",
          ownerName: data.ownerName || user?.fullName || "Trader",
          instrumentType: data.instrumentType || "weighing_scale",
          category: data.category || "Commercial Counter Scale (Class III)",
          make: data.make || "Standard Make",
          model: data.model || "Model A",
          serialNumber: data.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          capacity: data.capacity || "30 kg",
          leastCount: data.leastCount || "5 g",
          locationOfUse: data.locationOfUse || "Shop Floor",
          installationDate: data.installationDate || new Date().toISOString().split("T")[0],
          photoUrl: data.photoUrl ||
            "/instruments/counter-scale.jpg",
          status: "active",
          hasPendingApplication: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: user?.id,
          userName: user?.fullName || "Trader",
          userRole: "Business Owner",
          action: "REGISTER_INSTRUMENT",
          entityType: "Instrument",
          entityId: newInst.id,
          details: `Registered ${newInst.make} ${newInst.model} (SN: ${newInst.serialNumber}) under Legal Metrology inventory.`,
          ipAddress: "122.176.44.19",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          instruments: [newInst, ...state.instruments],
          auditLogs: [newLog, ...state.auditLogs],
        }));

        return newInst;
      },

      updateInstrument: (id, data) => {
        set((state) => ({
          instruments: state.instruments.map((inst) =>
            inst.id === id ? { ...inst, ...data, updatedAt: new Date().toISOString() } : inst
          ),
        }));
      },

      bulkAddInstruments: (list) => {
        const user = get().currentUser;
        const createdList: Instrument[] = list.map((item, idx) => ({
          id: `inst-${Date.now()}-${idx}`,
          businessId: item.businessId || user?.id || "usr-biz-01",
          businessName: item.businessName || user?.businessName || "Commercial Establishment",
          ownerName: item.ownerName || user?.fullName || "Trader",
          instrumentType: item.instrumentType || "weighing_scale",
          category: item.category || "Commercial Counter Scale (Class III)",
          make: item.make || "Make",
          model: item.model || "Model",
          serialNumber: item.serialNumber || `SN-BULK-${Math.floor(10000 + Math.random() * 90000)}`,
          capacity: item.capacity || "30 kg",
          leastCount: item.leastCount || "5 g",
          locationOfUse: item.locationOfUse || "Shop Floor",
          installationDate: item.installationDate || new Date().toISOString().split("T")[0],
          photoUrl: item.photoUrl ||
            "/instruments/counter-scale.jpg",
          status: "active",
          hasPendingApplication: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: user?.id,
          userName: user?.fullName || "Trader",
          userRole: "Business Owner",
          action: "BULK_IMPORT_INSTRUMENTS",
          entityType: "Instrument",
          details: `Imported ${createdList.length} instruments via CSV batch upload.`,
          ipAddress: "122.176.44.19",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          instruments: [...createdList, ...state.instruments],
          auditLogs: [newLog, ...state.auditLogs],
        }));

        return createdList;
      },

      createApplication: (data) => {
        const user = get().currentUser;
        const instrument = get().instruments.find((i) => i.id === data.instrumentId);
        const rate = STANDARD_FEE_RATES[instrument?.instrumentType || "weighing_scale"] || 750;
        const appNum = `APP/MH/2026/${Math.floor(100000 + Math.random() * 900000)}`;

        const newApp: Application = {
          id: `app-${Date.now()}`,
          applicationNumber: appNum,
          instrumentId: data.instrumentId,
          instrument,
          businessId: instrument?.businessId || user?.id || "usr-biz-01",
          businessName: instrument?.businessName || user?.businessName || "Commercial Establishment",
          applicantUserId: user?.id || "usr-biz-01",
          applicantName: user?.fullName || "Trader",
          applicationType: data.applicationType,
          status: "submitted",
          priority: data.priority || "normal",
          stateId: user?.stateId || "s-mh",
          district: user?.district || "Mumbai Suburban",
          feeAmount: rate,
          feePaid: true,
          paymentReference: `PAY-MH-UPI-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: data.notes,
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedInstruments = get().instruments.map((i) =>
          i.id === data.instrumentId ? { ...i, hasPendingApplication: true } : i
        );

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: user?.id,
          userName: user?.fullName || "Trader",
          userRole: "Business Owner",
          action: "SUBMIT_APPLICATION",
          entityType: "Application",
          entityId: newApp.id,
          details: `Submitted ${data.applicationType.replace("_", " ")} application (${appNum}) for ${instrument?.make || "Instrument"}. Fee ₹${rate} paid.`,
          ipAddress: "122.176.44.19",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: user?.id || "usr-biz-01",
          title: "Verification Application Submitted",
          message: `Application ${appNum} successfully recorded. Routed to Legal Metrology Department for officer allocation.`,
          type: "application_update",
          isRead: false,
          relatedEntityType: "application",
          relatedEntityId: newApp.id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          applications: [newApp, ...state.applications],
          instruments: updatedInstruments,
          auditLogs: [newLog, ...state.auditLogs],
          notifications: [notif, ...state.notifications],
        }));

        return newApp;
      },

      payApplicationFee: (appId, reference) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === appId
              ? {
                  ...app,
                  feePaid: true,
                  paymentReference: reference || `PAY-ONLINE-${Date.now()}`,
                  updatedAt: new Date().toISOString(),
                }
              : app
          ),
        }));
      },

      assignApplication: (appId, officerId, officerName, officerType = "lmo") => {
        set((state) => {
          const app = state.applications.find((a) => a.id === appId);
          const updatedApps = state.applications.map((a) =>
            a.id === appId
              ? {
                  ...a,
                  status: "assigned" as const,
                  assignedToUserId: officerId,
                  assignedToName: officerName,
                  assignedToType: officerType,
                  updatedAt: new Date().toISOString(),
                }
              : a
          );

          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: state.currentUser?.id || "usr-state-mh",
            userName: state.currentUser?.fullName || "State Admin",
            userRole: "State Admin",
            action: "ALLOCATE_TASK",
            entityType: "Application",
            entityId: appId,
            details: `Allocated Application ${app?.applicationNumber} to ${officerName} (${officerType.toUpperCase()}).`,
            ipAddress: "14.139.120.2",
            stateCode: "MH",
            createdAt: new Date().toISOString(),
          };

          const officerNotif: NotificationItem = {
            id: `notif-${Date.now()}-officer`,
            userId: officerId,
            title: "New Verification Task Assigned",
            message: `You have been allocated Application ${app?.applicationNumber} for ${app?.businessName}. Please review and schedule the visit.`,
            type: "application_update",
            isRead: false,
            relatedEntityType: "application",
            relatedEntityId: appId,
            createdAt: new Date().toISOString(),
          };

          const traderNotif: NotificationItem = {
            id: `notif-${Date.now()}-trader`,
            userId: app?.applicantUserId || "usr-biz-01",
            title: "Officer Assigned to Your Application",
            message: `Officer ${officerName} has been assigned for physical verification of your instrument.`,
            type: "application_update",
            isRead: false,
            relatedEntityType: "application",
            relatedEntityId: appId,
            createdAt: new Date().toISOString(),
          };

          return {
            applications: updatedApps,
            auditLogs: [newLog, ...state.auditLogs],
            notifications: [officerNotif, traderNotif, ...state.notifications],
          };
        });
      },

      scheduleApplication: (appId, scheduledDate, scheduledTimeSlot) => {
        set((state) => {
          const app = state.applications.find((a) => a.id === appId);
          const updatedApps = state.applications.map((a) =>
            a.id === appId
              ? {
                  ...a,
                  status: "scheduled" as const,
                  scheduledDate,
                  scheduledTimeSlot,
                  updatedAt: new Date().toISOString(),
                }
              : a
          );

          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: state.currentUser?.id || "usr-lmo-01",
            userName: state.currentUser?.fullName || "Inspector S. K. Kulkarni",
            userRole: "Legal Metrology Officer",
            action: "SCHEDULE_VISIT",
            entityType: "Application",
            entityId: appId,
            details: `Scheduled physical inspection on ${scheduledDate} (${scheduledTimeSlot}) for Application ${app?.applicationNumber}.`,
            ipAddress: "103.21.124.58",
            stateCode: "MH",
            createdAt: new Date().toISOString(),
          };

          const traderNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId: app?.applicantUserId || "usr-biz-01",
            title: "Verification Visit Scheduled",
            message: `Inspection visit scheduled for ${scheduledDate} (${scheduledTimeSlot}) by ${state.currentUser?.fullName || "LMO Inspector"}.`,
            type: "application_update",
            isRead: false,
            relatedEntityType: "application",
            relatedEntityId: appId,
            createdAt: new Date().toISOString(),
          };

          return {
            applications: updatedApps,
            auditLogs: [newLog, ...state.auditLogs],
            notifications: [traderNotif, ...state.notifications],
          };
        });
      },

      conductVerification: (appIdOrPayload: any, payload?: any) => {
        const state = get();
        const appId = typeof appIdOrPayload === "string" ? appIdOrPayload : appIdOrPayload?.applicationId;
        const actualPayload = typeof appIdOrPayload === "object" ? appIdOrPayload : (payload || {});
        const app = state.applications.find((a) => a.id === appId);
        const inst = state.instruments.find((i) => i.id === app?.instrumentId);
        const officer = state.currentUser || MOCK_USERS[3];

        if (!app || !inst) {
          return { success: false };
        }

        const now = new Date();
        const validFrom = now.toISOString().split("T")[0];
        const nextYear = new Date(now);
        nextYear.setFullYear(now.getFullYear() + 1);
        nextYear.setDate(nextYear.getDate() - 1);
        const validUntil = nextYear.toISOString().split("T")[0];

        if (actualPayload.result === "pass" || actualPayload.result === "conditional") {
          const certNum = `MH/2026/WS/${Math.floor(10000 + Math.random() * 90000)}`;
          const sealNum = actualPayload.sealNumber || actualPayload.verifierSealNumber || generateSealNumber("MH");
          const vToken = generateVerificationToken();
          const shaHash = generateCryptoHash(`${certNum}|${inst.serialNumber}|${sealNum}|${validFrom}|${validUntil}`);

          const newCert: Certificate = {
            id: `cert-${Date.now()}`,
            certificateNumber: certNum,
            applicationId: appId,
            instrumentId: inst.id,
            businessId: app.businessId,
            businessName: app.businessName,
            businessAddress: inst.locationOfUse,
            gstin: "27AABCA1234F1Z8",
            instrumentMake: inst.make,
            instrumentModel: inst.model,
            serialNumber: inst.serialNumber,
            instrumentType: inst.category || "Commercial Scale (Class III)",
            capacity: inst.capacity,
            leastCount: inst.leastCount,
            locationOfUse: inst.locationOfUse,
            issuedByUserId: officer.id,
            issuedByName: actualPayload.inspectorName || officer.fullName,
            issuedByDesignation: actualPayload.inspectorDesignation || officer.designation || "Senior Legal Metrology Inspector",
            issuedByRole: (officer.role === "gatc" ? "gatc" : "lmo"),
            sealNumber: sealNum,
            issueDate: now.toISOString(),
            validFrom,
            validUntil,
            qrCodeData: `https://lmovs.gov.in/verify/${certNum}?token=${vToken}`,
            status: "active",
            verificationToken: vToken,
            sha256Hash: shaHash,
            createdAt: now.toISOString(),
          };

          const updatedApp: Application = {
            ...app,
            status: "completed",
            updatedAt: now.toISOString(),
          };

          const updatedInst: Instrument = {
            ...inst,
            status: "active",
            lastVerificationDate: validFrom,
            validUntil,
            hasPendingApplication: false,
            updatedAt: now.toISOString(),
          };

          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: officer.id,
            userName: officer.fullName,
            userRole: officer.role === "gatc" ? "GATC Signatory" : "Legal Metrology Officer",
            action: "GENERATE_CERTIFICATE",
            entityType: "Certificate",
            entityId: newCert.id,
            details: `Approved verification result PASS and generated Certificate ${certNum} with Stamp ${sealNum}.`,
            ipAddress: "103.21.124.58",
            stateCode: "MH",
            createdAt: now.toISOString(),
          };

          const notif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId: app.applicantUserId,
            title: "Digital Certificate Issued",
            message: `Official Certificate ${certNum} stamped & issued for ${inst.make} ${inst.model}. Download your PDF copy.`,
            type: "certificate_issued",
            isRead: false,
            relatedEntityType: "certificate",
            relatedEntityId: newCert.id,
            createdAt: now.toISOString(),
          };

          set((s) => ({
            certificates: [newCert, ...s.certificates],
            applications: s.applications.map((a) => (a.id === appId ? updatedApp : a)),
            instruments: s.instruments.map((i) => (i.id === inst.id ? updatedInst : i)),
            auditLogs: [newLog, ...s.auditLogs],
            notifications: [notif, ...s.notifications],
          }));

          return { success: true, certificate: newCert, application: updatedApp };
        } else {
          const updatedApp: Application = {
            ...app,
            status: "rejected",
            updatedAt: now.toISOString(),
          };

          const updatedInst: Instrument = {
            ...inst,
            hasPendingApplication: false,
            updatedAt: now.toISOString(),
          };

          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: officer.id,
            userName: officer.fullName,
            userRole: "Legal Metrology Officer",
            action: "REJECT_VERIFICATION",
            entityType: "Application",
            entityId: appId,
            details: `Verification result FAILED for Application ${app.applicationNumber}. Defects: ${actualPayload.defectsFound || "Tolerance breach"}`,
            ipAddress: "103.21.124.58",
            stateCode: "MH",
            createdAt: now.toISOString(),
          };

          const notif: NotificationItem = {
            id: `notif-${Date.now()}`,
            userId: app.applicantUserId,
            title: "Verification Inspection Failed",
            message: `Inspection for ${inst.make} (SN: ${inst.serialNumber}) did not pass statutory limits. Reason: ${actualPayload.defectsFound || "Tolerance breach"}`,
            type: "application_update",
            isRead: false,
            relatedEntityType: "application",
            relatedEntityId: appId,
            createdAt: now.toISOString(),
          };

          set((s) => ({
            applications: s.applications.map((a) => (a.id === appId ? updatedApp : a)),
            instruments: s.instruments.map((i) => (i.id === inst.id ? updatedInst : i)),
            auditLogs: [newLog, ...s.auditLogs],
            notifications: [notif, ...s.notifications],
          }));

          return { success: true, application: updatedApp };
        }
      },

      revokeCertificate: (certId, reason) => {
        set((state) => {
          const cert = state.certificates.find((c) => c.id === certId || c.certificateNumber === certId);
          const updatedCerts = state.certificates.map((c) =>
            c.id === certId || c.certificateNumber === certId
              ? {
                  ...c,
                  status: "revoked" as const,
                  revocationReason: reason,
                  revokedAt: new Date().toISOString(),
                }
              : c
          );

          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            userId: state.currentUser?.id,
            userName: state.currentUser?.fullName || "Enforcement Authority",
            userRole: state.currentUser?.role || "Legal Metrology Officer",
            action: "REVOKE_CERTIFICATE",
            entityType: "Certificate",
            entityId: cert?.id,
            details: `Statutory revocation of Certificate ${cert?.certificateNumber || certId}: ${reason}`,
            ipAddress: "103.21.124.58",
            stateCode: "MH",
            createdAt: new Date().toISOString(),
          };

          return {
            certificates: updatedCerts,
            auditLogs: [newLog, ...state.auditLogs],
          };
        });
      },

      addUser: (data) => {
        const newId = `usr-${Date.now()}`;
        const newUser: User = {
          id: newId,
          email: data.email,
          phone: data.phone?.replace(/[^0-9]/g, "").slice(-10) || "9820011223",
          fullName: data.fullName,
          role: data.role || "business_owner",
          status: data.status || "pending_approval",
          businessName: data.businessName,
          gstin: data.gstin || "27AAACB" + Math.floor(1000 + Math.random() * 9000) + "A1Z5",
          stateId: data.stateId || "s-mh",
          stateName: data.stateName || "Maharashtra",
          district: data.district || "Mumbai Suburban",
          address: data.address,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: newId,
          userName: data.fullName,
          userRole: "Business Owner",
          action: "TRADER_REGISTRATION_SUBMITTED",
          entityType: "Business",
          entityId: newId,
          details: `Registered business ${data.businessName} awaiting approval.`,
          ipAddress: "122.176.44.19",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [newUser, ...state.users],
          auditLogs: [newLog, ...state.auditLogs],
        }));

        return newUser;
      },

      toggleUserStatus: (userId, status) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, status: status || (u.status === "active" ? "suspended" : "active") } : u)),
        }));
      },

      addOfficer: (data) => {
        const newId = `usr-${data.role}-${Date.now()}`;
        const newOfficer: User = {
          id: newId,
          email: data.email,
          phone: data.phone.replace(/[^0-9]/g, "").slice(-10),
          fullName: data.fullName,
          role: data.role,
          status: "active",
          designation: data.designation,
          stateId: data.stateId || "s-mh",
          stateName: data.stateName || "Maharashtra",
          district: data.district || "Pune",
          employeeId: data.employeeId || `LMO-MH-2026-${Math.floor(100 + Math.random() * 900)}`,
          gatcName: data.gatcName,
          registrationNumber: data.registrationNumber,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: get().currentUser?.id,
          userName: get().currentUser?.fullName || "State Admin",
          userRole: "State Admin",
          action: "PROVISION_OFFICER",
          entityType: "User",
          entityId: newId,
          details: `Provisioned new ${data.role.toUpperCase()} account for ${data.fullName} (${newOfficer.employeeId || data.designation}).`,
          ipAddress: "14.139.120.2",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [newOfficer, ...state.users],
          auditLogs: [newLog, ...state.auditLogs],
        }));

        return newOfficer;
      },

      toggleOfficerStatus: (userId, status) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, status: status || (u.status === "active" ? "suspended" : "active") } : u)),
        }));
      },

      addGrievance: (data) => {
        return get().submitGrievance(data);
      },

      submitGrievance: (data) => {
        const num = `GRV/MH/2026/${Math.floor(1000 + Math.random() * 9000)}`;
        const newGrv: Grievance = {
          id: `grv-${Date.now()}`,
          complaintNumber: num,
          complainantName: data.complainantName,
          complainantPhone: data.complainantPhone,
          complainantEmail: data.complainantEmail,
          targetBusinessName: data.targetBusinessName,
          targetAddress: data.targetAddress,
          district: data.district,
          stateName: data.stateName,
          category: data.category,
          description: data.description,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          action: "SUBMIT_GRIEVANCE",
          entityType: "Grievance",
          entityId: newGrv.id,
          details: `Consumer grievance ${num} registered against ${data.targetBusinessName} (${data.category?.replace("_", " ")}).`,
          ipAddress: "115.112.44.1",
          stateCode: "MH",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          grievances: [newGrv, ...state.grievances],
          auditLogs: [newLog, ...state.auditLogs],
        }));

        return newGrv;
      },

      updateGrievance: (id, dataOrStatus, notes) => {
        set((state) => {
          let payload: Partial<Grievance> = {};
          if (typeof dataOrStatus === "string") {
            payload = { status: dataOrStatus as any, resolutionNotes: notes };
          } else {
            payload = dataOrStatus;
          }
          return {
            grievances: state.grievances.map((g) => (g.id === id ? { ...g, ...payload } : g)),
          };
        });
      },

      addAuditLog: (log) => {
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          userId: log.userId || get().currentUser?.id,
          userName: log.userName || get().currentUser?.fullName || "System User",
          userRole: log.userRole || get().currentUser?.role || "User",
          action: log.action || "SYSTEM_EVENT",
          entityType: log.entityType || "General",
          entityId: log.entityId,
          details: log.details || JSON.stringify(log.newValues || {}),
          ipAddress: log.ipAddress || "127.0.0.1",
          stateCode: log.stateCode || "MH",
          createdAt: new Date().toISOString(),
          ...log,
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },

      addNotification: (notif) => {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: notif.userId || "usr-biz-01",
          title: notif.title || "System Notification",
          message: notif.message || "",
          type: notif.type || "application_update",
          isRead: false,
          createdAt: new Date().toISOString(),
          ...notif,
        };
        set((state) => ({ notifications: [newNotif, ...state.notifications] }));
      },

      globalSearch: (query) => {
        const res = get().searchAll(query);
        return {
          certificates: res.certificates,
          instruments: res.instruments,
          applications: res.applications,
          businesses: res.users.filter((u) => u.role === "business_owner" || u.businessName),
        };
      },

      addFee: (data) => {
        const newFee: FeeStructure = {
          id: `fee-${Date.now()}`,
          instrumentType: data.instrumentType || "weighing_scale",
          category: data.category || "General Weighing Machine",
          verificationType: data.verificationType || "re_verification",
          feeAmount: data.feeAmount || 750,
          effectiveFrom: data.effectiveFrom || "2026-01-01",
        };
        set((state) => ({
          feeStructures: [newFee, ...state.feeStructures],
        }));
      },

      updateFee: (id, feeAmount) => {
        set((state) => ({
          feeStructures: state.feeStructures.map((f) => (f.id === id ? { ...f, feeAmount } : f)),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      searchAll: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) {
          return { instruments: [], applications: [], certificates: [], grievances: [], users: [] };
        }
        const state = get();
        return {
          instruments: state.instruments.filter(
            (i) =>
              i.make.toLowerCase().includes(q) ||
              i.model.toLowerCase().includes(q) ||
              i.serialNumber.toLowerCase().includes(q) ||
              i.businessName.toLowerCase().includes(q)
          ),
          applications: state.applications.filter(
            (a) =>
              a.applicationNumber.toLowerCase().includes(q) ||
              a.businessName.toLowerCase().includes(q) ||
              a.instrument?.serialNumber?.toLowerCase().includes(q)
          ),
          certificates: state.certificates.filter(
            (c) =>
              c.certificateNumber.toLowerCase().includes(q) ||
              c.businessName.toLowerCase().includes(q) ||
              c.serialNumber.toLowerCase().includes(q) ||
              c.sealNumber.toLowerCase().includes(q)
          ),
          grievances: state.grievances.filter(
            (g) =>
              g.complaintNumber.toLowerCase().includes(q) ||
              g.targetBusinessName.toLowerCase().includes(q) ||
              g.complainantName.toLowerCase().includes(q)
          ),
          users: state.users.filter(
            (u) =>
              u.fullName.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              u.businessName?.toLowerCase().includes(q) ||
              u.gstin?.toLowerCase().includes(q)
          ),
        };
      },

      getDashboardStats: (role, user) => {
        const state = get();
        const activeRole = role || state.currentUser?.role || "business_owner";
        const currentUser = user !== undefined ? user : state.currentUser;

        const instruments = state.instruments;
        const certificates = state.certificates;
        const applications = state.applications;
        const grievances = state.grievances;
        const users = state.users;

        const expiringInstruments = instruments
          .map((inst) => {
            const cert = certificates.find((c) => c.instrumentId === inst.id && c.status === "active") ||
              certificates.find((c) => c.instrumentId === inst.id);
            const daysInfo = cert ? getDaysUntilExpiry(cert.validUntil) : { isDueSoon: false, isExpired: false, days: 0 };
            return {
              id: inst.id,
              make: inst.make,
              model: inst.model,
              serialNumber: inst.serialNumber,
              capacity: inst.capacity,
              locationOfUse: inst.locationOfUse,
              category: inst.category,
              certificateNumber: cert?.certificateNumber || "N/A",
              validUntil: cert?.validUntil || "Not Verified",
              daysRemaining: daysInfo.days,
              isExpired: daysInfo.isExpired,
              isDueSoon: daysInfo.isDueSoon,
              status: inst.status,
            };
          })
          .filter((i) => i.isDueSoon || i.isExpired || i.validUntil !== "Not Verified");

        const assignedQueue = applications
          .filter((a) => a.status === "assigned" || a.status === "scheduled")
          .map((a) => ({
            id: a.id,
            applicationNumber: a.applicationNumber,
            businessName: a.businessName,
            district: a.district || "Mumbai Suburban",
            instrumentMake: a.instrument?.make || "Standard Make",
            instrumentModel: a.instrument?.model || "Model",
            instrumentSerial: a.instrument?.serialNumber || "SN-001",
            applicationType: a.applicationType,
            visitDate: a.scheduledDate || "28 Aug 2026",
            status: a.status,
          }));

        return {
          totalInstruments: instruments.length,
          activeCertificates: certificates.filter((c) => c.status === "active").length,
          expiringSoonCount: expiringInstruments.filter((i) => i.isDueSoon).length,
          pendingApplications: applications.filter((a) => a.status !== "completed" && a.status !== "rejected").length,
          assignedTasks: applications.filter((a) => a.status === "assigned" || a.status === "scheduled").length,
          visitsScheduled: applications.filter((a) => a.status === "scheduled").length,
          certificatesStamped: certificates.length,
          activeGrievances: grievances.filter((g) => g.status !== "resolved" && g.status !== "rejected").length,
          activeOfficers: users.filter((u) => u.role === "lmo" || u.role === "gatc").length,
          passRate: 98.4,
          businessName: currentUser?.businessName || "A1 Supermarket & Retail Chain Ltd.",
          gstin: currentUser?.gstin || "27AABCA1234F1Z8",
          stateName: currentUser?.stateName || "Maharashtra",
          district: currentUser?.district || "Mumbai Suburban",
          employeeId: currentUser?.employeeId || "LMO-MH-2018-094",
          expiringInstruments,
          assignedQueue,
          recentAuditLogs: state.auditLogs.slice(0, 5),
          monthlyTrends: [
            { month: "Mar", applied: 120, verified: 115, rejected: 3 },
            { month: "Apr", applied: 145, verified: 140, rejected: 4 },
            { month: "May", applied: 160, verified: 155, rejected: 2 },
            { month: "Jun", applied: 190, verified: 184, rejected: 5 },
            { month: "Jul", applied: 220, verified: 212, rejected: 6 },
            { month: "Aug", applied: 260, verified: 248, rejected: 7 },
          ],
          outcomes: [
            { name: "Verified & Passed", value: 92, color: "#059669" },
            { name: "Requires Recalibration", value: 5, color: "#D97706" },
            { name: "Rejected / Tampered", value: 3, color: "#DC2626" },
          ],
          districtWorkload: [
            { district: "Mumbai Suburban", completed: 420, pending: 45 },
            { district: "Pune", completed: 380, pending: 38 },
            { district: "Thane", completed: 290, pending: 25 },
            { district: "Nagpur", completed: 210, pending: 18 },
            { district: "Nashik", completed: 180, pending: 12 },
          ],
        };
      },

      resetToDefaults: () => {
        set({
          currentUser: MOCK_USERS[6],
          users: MOCK_USERS,
          instruments: MOCK_INSTRUMENTS,
          applications: MOCK_APPLICATIONS,
          certificates: MOCK_CERTIFICATES,
          notifications: MOCK_NOTIFICATIONS,
          auditLogs: MOCK_AUDIT_LOGS,
          grievances: MOCK_GRIEVANCES,
          feeStructures: MOCK_FEES,
        });
      },
    }),
    {
      name: "lmovs-mock-store-v2",
      skipHydration: true,
    }
  )
);
