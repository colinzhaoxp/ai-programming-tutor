export interface SkillProfileItem {
  topic: string;
  masteryLevel: number;
  evidence: string[];
}

export interface AssessmentResult {
  level: "beginner" | "basic" | "intermediate" | "advanced";
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface GeneratedExercise {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  starterCode: string;
  expectedOutput: string;
  learningPurpose: string;
}

export interface GeneratedLearningPlan {
  title: string;
  description: string;
  aiGeneratedReason: string;
  stages: {
    order: number;
    title: string;
    description: string;
    keyTopics: string[];
    estimatedHours: number;
  }[];
}

export interface CodeFeedbackAnalysis {
  meetsRequirements: boolean;
  syntaxIssues: string[];
  logicIssues: string[];
  cStylePatterns: string[];
  pythonicSuggestions: string[];
  overallFeedback: string;
  score: number;
}
