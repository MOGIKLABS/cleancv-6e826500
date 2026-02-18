export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
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
    summary: "Passionate software engineer with 8+ years of experience building scalable web applications. Specialized in React, TypeScript, and cloud-native architectures.",
  },
  experiences: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Senior Software Engineer",
      startDate: "2021",
      endDate: "Present",
      description: "Led a team of 5 engineers to build a real-time analytics platform serving 10M+ users. Reduced page load time by 40% through performance optimizations.",
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
