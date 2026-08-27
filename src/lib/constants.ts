export const APP_NAME = "Legal Metrology Online Verification System";
export const APP_SHORT_NAME = "LMOVS";
export const MINISTRY_NAME = "Ministry of Consumer Affairs, Food & Public Distribution";
export const DEPARTMENT_NAME = "Department of Consumer Affairs (DoCA)";
export const GOV_PORTAL_URL = "https://consumeraffairs.gov.in";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin (DoCA Central)",
  state_admin: "State Admin (Legal Metrology)",
  lmo: "Legal Metrology Officer (LMO)",
  gatc: "Govt. Approved Test Centre (GATC)",
  business_owner: "Business Owner / Trader",
  public: "Citizen / Public User",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", label: "Draft" },
  submitted: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Submitted" },
  assigned: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Assigned" },
  scheduled: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Scheduled" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "In Progress" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Verified & Passed" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Rejected / Failed" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Active & Valid" },
  expired: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Expired" },
  revoked: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300", label: "Revoked" },
  pending_approval: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending Approval" },
};

export const INSTRUMENT_TYPES = [
  { value: "weighing_scale", label: "Electronic Weighing Scale / Counter Scale" },
  { value: "measuring_instrument", label: "Automatic Gravimetric / Liquid Measuring System" },
  { value: "weight", label: "Standard Cast Iron / Brass Weight (Class F/M)" },
  { value: "measure", label: "Liquid Capacity Measure / Conical Measure" },
];

export const INSTRUMENT_CATEGORIES = [
  "Non-Automatic Weighing Instruments (NAWI)",
  "Automatic Weighing Instruments (AWI)",
  "Fuel Dispenser / Flow Meter",
  "Weighbridge (Vehicle Scale)",
  "Commercial Counter Scale (Class III)",
  "High Precision Analytical Balance (Class I/II)",
  "Platform Weighing Scale",
  "Storage Tank Capacity Measure",
];

export const INDIAN_STATES = [
  { id: "s-dl", code: "DL", name: "Delhi", districts: ["Central Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"] },
  { id: "s-mh", code: "MH", name: "Maharashtra", districts: ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"] },
  { id: "s-ka", code: "KA", name: "Karnataka", districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"] },
  { id: "s-tn", code: "TN", name: "Tamil Nadu", districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"] },
  { id: "s-up", code: "UP", name: "Uttar Pradesh", districts: ["Lucknow", "Kanpur Nagar", "Gautam Buddha Nagar (Noida)", "Varanasi", "Agra", "Prayagraj"] },
  { id: "s-wb", code: "WB", name: "West Bengal", districts: ["Kolkata", "North 24 Parganas", "South 24 Parganas", "Howrah", "Darjeeling", "Hooghly"] },
  { id: "s-gj", code: "GJ", name: "Gujarat", districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar"] },
  { id: "s-rj", code: "RJ", name: "Rajasthan", districts: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur", "Ajmer"] },
  { id: "s-tg", code: "TG", name: "Telangana", districts: ["Hyderabad", "Ranga Reddy", "Medchal-Malkajgiri", "Warangal", "Nizamabad"] },
];

export const STANDARD_FEE_RATES: Record<string, number> = {
  "weighing_scale": 750,
  "measuring_instrument": 1500,
  "weight": 250,
  "measure": 400,
};
