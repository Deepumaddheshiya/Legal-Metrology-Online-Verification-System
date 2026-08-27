import { create } from "zustand";

export type Language = "en" | "hi";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    app_title: "Legal Metrology Online Verification System",
    ministry_title: "Ministry of Consumer Affairs, Food & Public Distribution",
    doca: "Department of Consumer Affairs, Govt. of India",
    dashboard: "Dashboard",
    instruments: "Instruments",
    applications: "Applications",
    certificates: "Certificates",
    reports: "Reports & Analytics",
    audit_logs: "Security Audit Logs",
    verify_cert: "Verify Certificate",
    complaints: "Grievances",
    apply_verification: "Apply for Verification",
    active_instruments: "Active Instruments",
    expiring_soon: "Expiring Soon (30 Days)",
    expired: "Expired Instruments",
    pending_approvals: "Pending Applications",
    pass: "Pass / Verified",
    fail: "Fail / Defective",
    download_pdf: "Download Certificate PDF",
    scan_qr: "Scan QR Code",
    submit: "Submit",
    cancel: "Cancel",
  },
  hi: {
    app_title: "विधिक मापविज्ञान ऑनलाइन सत्यापन प्रणाली",
    ministry_title: "उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    doca: "उपभोक्ता मामले विभाग, भारत सरकार",
    dashboard: "डैशबोर्ड",
    instruments: "उपकरण एवं माप यंत्र",
    applications: "सत्यापन आवेदन",
    certificates: "डिजिटल प्रमाणपत्र",
    reports: "रिपोर्ट और विश्लेषण",
    audit_logs: "सुरक्षा ऑडिट लॉग",
    verify_cert: "प्रमाणपत्र सत्यापित करें",
    complaints: "शिकायत निवारण",
    apply_verification: "सत्यापन हेतु आवेदन करें",
    active_instruments: "सक्रिय उपकरण",
    expiring_soon: "शीघ्र समाप्त होने वाले (30 दिन)",
    expired: "समाप्त उपकरण",
    pending_approvals: "लंबित आवेदन",
    pass: "सत्यापित (उत्तीर्ण)",
    fail: "अस्वीकृत (दोषपूर्ण)",
    download_pdf: "प्रमाणपत्र पीडीएफ डाउनलोड करें",
    scan_qr: "क्यूआर कोड स्कैन करें",
    submit: "जमा करें",
    cancel: "रद्द करें",
  },
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "en",
  setLanguage: (lang: Language) => set({ language: lang }),
  t: (key: string) => {
    const lang = get().language;
    return DICTIONARY[lang][key] || DICTIONARY["en"][key] || key;
  },
}));
