
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coffee, Sandwich, UserCheck, UserX, Waves, Loader2 } from "lucide-react"; 
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, type Timestamp } from 'firebase/firestore';

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon: Icon, color = "text-primary" }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

interface FirestoreAgentStatus {
  agentId: string;
  agentEmail?: string;
  agentName?: string;
  currentStatus: string;
  lastUpdate: Timestamp | {toDate: () => Date}; // Firestore Timestamp or an object that can be converted
  photoURL?: string;
}

interface AgentStatusSummaryData {
  totalMonitoredAgents: number;
  workingAgents: number;
  onLunchAgents: number;
  onBreakAgents: number;
  onBathroomAgents: number;
  clockedOutAgents: number;
}

export function AgentStatusSummary() {
  const [summaryData, setSummaryData] = useState<AgentStatusSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "agentStatuses"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const statuses: FirestoreAgentStatus[] = [];
      querySnapshot.forEach((doc) => {
        statuses.push(doc.data() as FirestoreAgentStatus);
      });

      let workingAgents = 0;
      let onLunchAgents = 0;
      let onBreakAgents = 0;
      let onBathroomAgents = 0;
      let clockedOutAgents = 0;

      statuses.forEach(status => {
        switch (status.currentStatus) {
          case "Clocked In - Working":
            workingAgents++;
            break;
          case "On Lunch":
            onLunchAgents++;
            break;
          case "On Break":
            onBreakAgents++;
            break;
          case "On Bathroom Break":
            onBathroomAgents++;
            break;
          case "Clocked Out":
            clockedOutAgents++;
            break;
          default:
            // Could be an unknown state, or an agent who is implicitly active but not explicitly "Working"
            // For now, we only count explicitly set statuses.
            break;
        }
      });
      
      // If an agent's status is not "Clocked Out" and not any of the break types, they are considered working.
      // This might need refinement based on how "Clocked In - Working" vs other "active" states are set.
      // For this summary, 'workingAgents' now includes "Clocked In - Working". "On Bathroom Break" is separate.

      setSummaryData({
        totalMonitoredAgents: statuses.length,
        workingAgents,
        onLunchAgents,
        onBreakAgents,
        onBathroomAgents,
        clockedOutAgents,
      });
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching agent statuses from Firestore:", err);
      setError("Failed to load real-time agent statuses.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <Loader2 className="h-5 w-5 text-muted animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center py-4">{error}</p>;
  }

  if (!summaryData) {
    return <p className="text-muted-foreground text-center py-4">No agent status data available.</p>;
  }
  
  // Calculate total active (not clocked out) agents for the "Total Monitored Agents" card title,
  // or simply use totalMonitoredAgents for the number of agents we have status for.
  // Let's use totalMonitoredAgents as the count of agents whose status is being tracked.
  const activelyTracked = summaryData.totalMonitoredAgents; 


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"> {/* Adjusted to 5 columns */}
      <StatusCard title="Monitored Agents" value={activelyTracked} icon={Users} />
      <StatusCard title="Working" value={summaryData.workingAgents} icon={UserCheck} color="text-accent" />
      <StatusCard title="On Lunch" value={summaryData.onLunchAgents} icon={Sandwich} color="text-orange-500" /> 
      <StatusCard title="On Break" value={summaryData.onBreakAgents} icon={Coffee} color="text-yellow-500" />
      <StatusCard title="Bathroom Break" value={summaryData.onBathroomAgents} icon={Waves} color="text-blue-400" />
      {/* Clocked out is implicitly totalMonitored - (working + lunch + break + bathroom) OR summaryData.clockedOutAgents */}
      {/* Let's display clockedOutAgents directly as it's clearer */}
      {/* <StatusCard title="Clocked Out" value={summaryData.clockedOutAgents} icon={UserX} color="text-slate-500" /> */}
       {/* The sum of (Working, Lunch, Break, Bathroom, ClockedOut) should ideally equal TotalMonitoredAgents.
           If there are discrepancies, it might mean some agents have statuses not covered by these categories.
           For now, we'll show up to 5 main status cards.
        */}
    </div>
  );
}

