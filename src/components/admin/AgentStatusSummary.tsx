
"use client";

import type { AgentLogEntry } from "@/app/actions/getTodaysAgentLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coffee, Briefcase, AlertTriangle, UserCheck, UserX, Waves } from "lucide-react"; // Added Waves
import { useMemo } from "react";

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

interface AgentStatusSummaryProps {
  todaysLogs?: AgentLogEntry[];
}

export function AgentStatusSummary({ todaysLogs }: AgentStatusSummaryProps) {
  const summaryData = useMemo(() => {
    if (!todaysLogs || todaysLogs.length === 0) {
      return {
        agentsWhoLoggedToday: 0,
        activeAgents: 0,
        onBreakAgents: 0,
        onLunchAgents: 0,
        onBathroomAgents: 0,
        offlineAgents: 0,
        outOfAdherence: 0, // Mock data for now
      };
    }

    const agentLastStatus: Record<string, string> = {};
    const uniqueAgentIdentifiers = new Set<string>();

    // Sort logs by timestamp descending to easily find the last status.
    // The logs from getTodaysAgentLogs are already reversed (newest first).
    // If not, uncomment and use: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    todaysLogs.forEach(log => {
      const agentIdentifier = log.agentEmail || log.agentId; // Prefer email, fallback to ID
      if (!agentIdentifier) return;

      uniqueAgentIdentifiers.add(agentIdentifier);

      if (!agentLastStatus[agentIdentifier]) { // Only take the newest status for each agent
        agentLastStatus[agentIdentifier] = log.statusMessage;
      }
    });
    
    let activeAgents = 0;
    let onBreakAgents = 0;
    let onLunchAgents = 0;
    let onBathroomAgents = 0;
    let offlineAgents = 0;

    Object.values(agentLastStatus).forEach(status => {
      switch (status) {
        case "Clocked In - Working":
          activeAgents++;
          break;
        case "On Lunch":
          onLunchAgents++;
          break;
        case "On Break":
          onBreakAgents++;
          break;
        case "On Bathroom Break":
          onBathroomAgents++; // Count separately
          break;
        case "Clocked Out":
          offlineAgents++;
          break;
        default:
          // Could count as 'active' or 'unknown' depending on rules
          // For now, if status is not explicitly 'Clocked Out', 'On Lunch', 'On Break', or 'On Bathroom Break',
          // and they have logged activity, consider them active if not one of these.
          // However, this might misrepresent if their actual last status was "Clocked In - Working" which is already handled.
          // Let's be specific. If a status isn't one of the above, it doesn't fit cleanly into these categories from last log.
          // The most robust way to get 'active' is if their last Clock In > last Clock Out
          // For now, we rely on explicit status messages.
          break;
      }
    });
    
    // If an agent has logged activity but their final status isn't Clocked Out,
    // and not on Lunch/Break/Bathroom, they might be implicitly active.
    // This logic can be refined. For now, `activeAgents` only counts "Clocked In - Working".
    // The sum of categorized agents might not equal uniqueAgentIdentifiers.size if some last statuses are ambiguous.

    return {
      agentsWhoLoggedToday: uniqueAgentIdentifiers.size,
      activeAgents,
      onBreakAgents,
      onLunchAgents,
      onBathroomAgents,
      offlineAgents,
      outOfAdherence: 0, // Mock data for now
    };
  }, [todaysLogs]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatusCard title="Logged Activity Today" value={summaryData.agentsWhoLoggedToday} icon={Users} />
      <StatusCard title="Working" value={summaryData.activeAgents} icon={UserCheck} color="text-accent" />
      <StatusCard title="On Lunch" value={summaryData.onLunchAgents} icon={Sandwich} color="text-orange-500" /> 
      <StatusCard title="On Break" value={summaryData.onBreakAgents} icon={Coffee} color="text-yellow-500" />
      <StatusCard title="Bathroom Break" value={summaryData.onBathroomAgents} icon={Waves} color="text-blue-400" />
      <StatusCard title="Clocked Out" value={summaryData.offlineAgents} icon={UserX} color="text-slate-500" />
      {/* <StatusCard title="Out of Adherence" value={summaryData.outOfAdherence} icon={AlertTriangle} color="text-destructive" /> */}
    </div>
  );
}
// Replaced Briefcase with Sandwich for lunch to align with agent controls
// Added Waves icon for Bathroom Break
// Renamed "Active" to "Working" for clarity
// Renamed "Offline" to "Clocked Out"
// Commented out "Out of Adherence" as it's still mock and this summary is becoming more data-driven

