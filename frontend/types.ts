export type IdeaStatus = 'draft' | 'evaluating' | 'evaluated' | 'go' | 'hold' | 'reject';

export interface IdeaScores {
  market: number;
  buildability: number;
  business: number;
  total: number;
}

export interface Creator {
  name: string;
  avatar: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  createdAt: string;
  createdBy?: Creator;
  
  // Scores & Decision
  scores?: IdeaScores;
  recommendation?: 'go' | 'hold' | 'reject';
  
  // Content Content
  idea_document?: string;
  market_report?: string;
  prd?: string;
  risk_assessment?: string;
  evaluation_summary?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface EvaluationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
}