import { CVData, CVCustomisation, CoverLetterData, defaultCVData, defaultCustomisation, defaultCoverLetterData } from "@/types/cv";

const CURRENT_KEY = "cleancv-draft";
const DRAFTS_KEY = "cleancv-drafts";
const DRAFT_VERSION = 3;

export interface DraftData {
  id: string;
  label: string;
  cvData: CVData;
  customisation: CVCustomisation;
  coverLetter: CoverLetterData;
  jobDescription: string;
  savedAt: string;
  version: number;
}

/** Merge saved data with current defaults so new fields always exist */
function hydrateCVData(raw: Partial<CVData> | undefined): CVData {
  if (!raw) return { ...defaultCVData };
  return {
    personal: { ...defaultCVData.personal, ...(raw.personal ?? {}) },
    experiences: raw.experiences ?? [],
    education: (raw.education ?? []).map((e: any) => ({ grade: "", ...e })),
    skills: raw.skills ?? [],
  };
}

function hydrateCustomisation(raw: Partial<CVCustomisation> | undefined): CVCustomisation {
  if (!raw) return { ...defaultCustomisation };
  return { ...defaultCustomisation, ...raw };
}

function hydrateCoverLetter(raw: Partial<CoverLetterData> | undefined): CoverLetterData {
  if (!raw) return { ...defaultCoverLetterData };
  return { ...defaultCoverLetterData, ...raw };
}

// ── Current (active) draft ──

export function loadCurrentDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.version || parsed.version < DRAFT_VERSION) {
      localStorage.removeItem(CURRENT_KEY);
      return null;
    }
    return {
      id: parsed.id || crypto.randomUUID(),
      label: parsed.label || "Untitled Draft",
      cvData: hydrateCVData(parsed.cvData),
      customisation: hydrateCustomisation(parsed.customisation),
      coverLetter: hydrateCoverLetter(parsed.coverLetter),
      jobDescription: parsed.jobDescription ?? "",
      savedAt: parsed.savedAt,
      version: DRAFT_VERSION,
    };
  } catch {
    return null;
  }
}

export function saveCurrentDraft(draft: Omit<DraftData, "id" | "label" | "version" | "savedAt"> & { id?: string; label?: string }): DraftData {
  const full: DraftData = {
    id: draft.id || crypto.randomUUID(),
    label: draft.label || draft.cvData.personal.fullName || "Untitled Draft",
    cvData: draft.cvData,
    customisation: draft.customisation,
    coverLetter: draft.coverLetter,
    jobDescription: draft.jobDescription,
    savedAt: new Date().toISOString(),
    version: DRAFT_VERSION,
  };
  localStorage.setItem(CURRENT_KEY, JSON.stringify(full));
  return full;
}

// ── Draft history ──

export function loadAllDrafts(): DraftData[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DraftData[];
  } catch {
    return [];
  }
}

export function saveDraftToHistory(draft: DraftData): DraftData[] {
  const existing = loadAllDrafts();
  // Replace if same id exists, otherwise prepend
  const idx = existing.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    existing[idx] = draft;
  } else {
    existing.unshift(draft);
  }
  // Keep max 20 drafts
  const trimmed = existing.slice(0, 20);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function deleteDraftFromHistory(id: string): DraftData[] {
  const remaining = loadAllDrafts().filter((d) => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(remaining));
  return remaining;
}

export function exportDraftAsJSON(draft: DraftData): void {
  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${draft.label || "draft"}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDraftFromJSON(file: File): Promise<DraftData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const draft: DraftData = {
          id: crypto.randomUUID(),
          label: parsed.label || parsed.cvData?.personal?.fullName || "Imported Draft",
          cvData: hydrateCVData(parsed.cvData),
          customisation: hydrateCustomisation(parsed.customisation),
          coverLetter: hydrateCoverLetter(parsed.coverLetter),
          jobDescription: parsed.jobDescription ?? "",
          savedAt: new Date().toISOString(),
          version: DRAFT_VERSION,
        };
        resolve(draft);
      } catch (err) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
