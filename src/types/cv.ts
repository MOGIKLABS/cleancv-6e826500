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
  startDate: string;
  endDate: string;
}

export interface CoverLetterData {
  recipientName: string;
  date: string; // ISO date string
  jobTitle: string; // auto-populated from ATS tab
  body: string; // the main letter content (max 500 words)
  signOff: string;
  signatureMode: "image" | "draw"; // toggle between uploaded image or drawn signature
  signatureImage: string; // base64 data URL for uploaded or drawn signature
}

export const defaultCoverLetterData: CoverLetterData = {
  recipientName: "Dear Hiring Manager,",
  date: new Date().toISOString().split("T")[0],
  jobTitle: "",
  body: "",
  signOff: "Yours sincerely,",
  signatureMode: "draw",
  signatureImage: "",
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
    fullName: "Alex Johnson",
    title: "Senior Software Engineer",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    summary: "Passionate software engineer with 8+ years of experience building scalable web applications. Specialised in React, TypeScript, and cloud-native architectures.",
    linkedin: "",
    github: "",
    photo: "",
  },
  experiences: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Senior Software Engineer",
      startDate: "2021",
      endDate: "Present",
      description: "Led a team of 5 engineers to build a real-time analytics platform serving 10M+ users. Reduced page load time by 40% through performance optimisations.",
    },
    {
      id: "2",
      company: "StartupXYZ",
      position: "Full Stack Developer",
      startDate: "2018",
      endDate: "2021",
      description: "Built and maintained core product features using React and Node.js. Implemented CI/CD pipelines and improved test coverage from 45% to 90%.",
    },
  ],
  education: [
    {
      id: "1",
      institution: "University of California, Berkeley",
      degree: "B.S.",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2018",
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "PostgreSQL"],
};
