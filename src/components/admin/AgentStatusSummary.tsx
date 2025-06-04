
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coffee, Sandwich, UserCheck, UserX, Waves, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, type Timestamp as FirestoreTimestampType } from 'firebase/firestore'; // Use FirestoreTimestampType alias
import { cn } from "@/lib/utils";
import type { AgentStatusFirestore } from "@/lib/types"; // Use updated type

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
  valueClassName?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon: Icon, color = "text-primary", valueClassName }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className={cn("text-3xl font-bold", valueClassName)}>{value}</div>
    </CardContent>
  </Card>
);

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
      const statuses: AgentStatusFirestore[] = [];
      querySnapshot.forEach((doc) => {
        // Ensure Timestamps are handled correctly if they come from Firestore
        const data = doc.data();
        const statusEntry: AgentStatusFirestore = {
          agentId: data.agentId,
          agentName: data.agentName,
          agentEmail: data.agentEmail,
          photoURL: data.photoURL,
          currentStatus: data.currentStatus,
          currentActivityType: data.currentActivityType,
          activityStartTime: data.activityStartTime, // This will be a Firestore Timestamp
          lastUpdate: data.lastUpdate, // This will be a Firestore Timestamp
        };
        statuses.push(statusEntry);
      });

      let workingAgents = 0;
      let onLunchAgents = 0;
      let onBreakAgents = 0;
      let onBathroomAgents = 0;
      let clockedOutAgents = 0;
      let activelyTrackedCount = 0; // Agents not clocked out or offline

      statuses.forEach(status => {
        if (status.currentStatus !== "Clocked Out" && status.currentStatus !== "Offline") {
          activelyTrackedCount++;
        }
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
          case "Offline":
            clockedOutAgents++;
            break;
        }
      });
      
      setSummaryData({
        totalMonitoredAgents: activelyTrackedCount, // Show only actively monitored agents
        workingAgents,
        onLunchAgents,
        onBreakAgents,
        onBathroomAgents,
        clockedOutAgents, // Keep this for internal logic if needed, but totalMonitored is more relevant for display
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

  const getWorkingAgentsColorClass = (count: number): string => {
    if (count >= 7) return "text-green-600";
    if (count >= 5) return "text-yellow-500"; // 5 or 6
    return "text-red-600"; // Below 5
  };

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
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatusCard title="Active Agents" value={summaryData.totalMonitoredAgents} icon={Users} />
      <StatusCard 
        title="Working" 
        value={summaryData.workingAgents} 
        icon={UserCheck} 
        color="text-accent"
        valueClassName={getWorkingAgentsColorClass(summaryData.workingAgents)}
      />
      <StatusCard title="On Lunch" value={summaryData.onLunchAgents} icon={Sandwich} color="text-orange-500" /> 
      <StatusCard title="On Break" value={summaryData.onBreakAgents} icon={Coffee} color="text-yellow-500" />
      <StatusCard title="Bathroom Break" value={summaryData.onBathroomAgents} icon={Waves} color="text-blue-400" />
    </div>
  );
}
