export interface ModuleDetails {
  score: number;
  maxScore: number;
  status: 'Green' | 'Yellow' | 'Red';
  feedback: string[];
  positivePoints: string[];
}

export interface AnalysisResult {
  candidateProfile: {
    name: string;
    type: 'Fresher' | 'Experienced';
    targetRole: string;
    detectedYoE: number;
  };
  overallScore: number;
  percentile: number; // vs Indian benchmarks
  modules: {
    academics: ModuleDetails;
    techSkills: ModuleDetails;
    projects: ModuleDetails;
    experience: ModuleDetails;
    professionalism: ModuleDetails; // Indian norms + Language
    formatting: ModuleDetails;
  };
  criticalRedFlags: string[];
  topLeverageFixes: {
    category: string;
    fix: string;
    example: string;
  }[];
}

export enum ParsingStatus {
  IDLE,
  UPLOADING,
  ANALYZING,
  COMPLETE,
  ERROR
}