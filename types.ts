export interface User {
  id: string;
  name: string;
  email: string;
  voucherBalance: number;
}

export interface Training {
  id: string;
  name: string;
  description: string;
}

// FIX: Define and export the ProjectPlan and related types to resolve module import errors.
export interface TechStackItem {
  name: string;
  reason: string;
}

export interface ProjectPlan {
  projectName: string;
  description: string;
  keyFeatures: string[];
  techStack: TechStackItem[];
  nextSteps: string[];
}