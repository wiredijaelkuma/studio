
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
  id: string; // Usually the Firestore document ID if applicable, or a generated one
  agentId: string;
  type: AgentActivityType;
  timestamp: Date; // Stored as Date object
  notes?: string;
}

export interface AgentStatusFirestore { // Renamed to avoid confusion with general AgentStatus
  agentId: string;
  agentName?: string;
  agentEmail?: string;
  photoURL?: string;
  currentStatus: string;
  currentActivityType: 'lunch' | 'break' | 'bathroom' | null;
  activityStartTime?: firebase.firestore.Timestamp | null; // Firestore Timestamp
  lastUpdate: firebase.firestore.Timestamp; // Firestore Timestamp
}

// This type is for data retrieved from Google Sheets via server action
export interface AgentLogEntry {
  timestamp: string; // This will be a string after fetching from sheets and formatting
  agentId: string;
  agentEmail: string | null | undefined;
  agentName: string | null | undefined;
  activityType: string;
  statusMessage: string;
}
