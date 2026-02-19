export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin?: string;
  github?: string;
  photo?: string; // base64 data URL
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  grade: string;
  startDate: string;
  endDate: string;
  inProgress?: boolean;
}

export interface CoverLetterData {
  recipientName: string;
  date: string; // ISO date string
  jobTitle: string; // auto-populated from ATS tab
  body: string; // the main letter content (max 500 words)
  signOff: string;
  signatureMode: "image" | "draw";
  signatureImage: string;
  // Optional overrides – when empty, CV data is used
  overrideFullName?: string;
  overrideEmail?: string;
  overridePhone?: string;
  overrideLinkedin?: string;
  overrideGithub?: string;
  overrideLocation?: string;
  // Seal / stamp image
  sealImage?: string;       // base64 data URL (PNG)
  sealSize?: number;        // size in mm (default 30)
  sealOffsetX?: number;     // horizontal offset from right edge in mm (default 0)
  sealOffsetY?: number;     // vertical offset from bottom of sign-off in mm (default 0)
}

export const defaultCoverLetterData: CoverLetterData = {
  recipientName: "Dear Hiring Manager,",
  date: new Date().toISOString().split("T")[0],
  jobTitle: "",
  body: "",
  signOff: "Yours sincerely,",
  signatureMode: "draw",
  signatureImage: "",
  overrideFullName: "",
  overrideEmail: "",
  overridePhone: "",
  overrideLinkedin: "",
  overrideGithub: "",
  overrideLocation: "",
  sealImage: "",
  sealSize: 30,
  sealOffsetX: 0,
  sealOffsetY: 0,
};

export type TemplateName = "classic" | "modern" | "minimal" | "creative" | "executive";

export interface CVCustomisation {
  template: TemplateName;
  primaryColour: string;   // HSL string e.g. "174 72% 40%"
  sidebarColour: string;
  textColour: string;
  fontFamily: string;
  headingFont: string;
  fontSize: number; // base px
  headingBold: boolean;
  bodyItalic: boolean;
}

export const defaultCustomisation: CVCustomisation = {
  template: "minimal",
  primaryColour: "0 0% 0%",
  sidebarColour: "0 0% 96%",
  textColour: "0 0% 10%",
  fontFamily: "Inter",
  headingFont: "Cormorant Garamond",
  fontSize: 11,
  headingBold: true,
  bodyItalic: false,
};

export interface CVData {
  personal: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
}

export const defaultCVData: CVData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    linkedin: "",
    github: "",
    photo: "",
  },
  experiences: [],
  education: [],
  skills: [],
};
