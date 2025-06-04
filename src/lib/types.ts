export type AgentActivityType = 
  | "clock-in" 
  | "clock-out" 
  | "lunch-start" 
  | "lunch-end" 
  | "break-start" 
  | "break-end" 
  | "bathroom-start" 
  | "bathroom-end";

export interface AgentActivityLog {
  id: string;
  agentId: string;
  type: AgentActivityType;
  timestamp: Date;
  notes?: string;
}

export interface AgentStatus {
  agentId: string;
  name: string;
  currentStatus: string; // e.g., "Online", "On Lunch", "On Break", "Offline"
  lastActivityTime: Date;
  isAdherent?: boolean; // Optional: can be populated by adherence check
}

export interface AdherenceAnalysisResult {
  isOutOfAdherence: boolean;
  reason: string;
}
