export interface ApplicationEntry {
  id: string;
  company: string;
  role: string;
  dateSent: string;
  status: "sent" | "interview" | "rejected" | "offered" | "accepted";
  notes: string;
}

const STORAGE_KEY = "resumeforge_applications";

export const getApplications = (): ApplicationEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveApplications = (entries: ApplicationEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};
