
import type { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

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

export interface AgentStatusFirestore {
  agentId: string;
  agentName?: string | null; // Name from Google Auth
  adminDisplayName?: string | null; // Display name set by admin
  agentEmail?: string | null;
  photoURL?: string | null;
  currentStatus: string;
  currentActivityType: 'lunch' | 'break' | 'bathroom' | null;
  activityStartTime?: FirebaseTimestamp | null;
  lastUpdate: FirebaseTimestamp;
}

export interface AgentLogEntry {
  timestamp: string;
  agentId: string;
  agentEmail: string | null | undefined;
  agentName: string | null | undefined; // This will be the name logged at the time of activity
  activityType: string;
  statusMessage: string;
}

export interface AdherenceViolationFirestore {
  id?: string; // Firestore document ID
  agentId: string;
  agentName?: string | null; // Name from Google Auth at time of violation
  agentEmail?: string | null;
  photoURL?: string | null;
  activityType: 'lunch' | 'break'; // Type of activity that was overdue
  violationTimestamp: FirebaseTimestamp; // When the violation alert was triggered
  expectedDurationMinutes: number;
  gracePeriodMinutes: number;
  statusWhenTriggered: string; // e.g., "On Lunch"
}
