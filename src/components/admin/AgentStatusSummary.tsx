"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coffee, Briefcase, AlertTriangle, UserCheck, UserX } from "lucide-react";

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

export function AgentStatusSummary() {
  // Mock data
  const summaryData = {
    totalAgents: 25,
    activeAgents: 18,
    onBreak: 3,
    onLunch: 2,
    offline: 2,
    outOfAdherence: 1,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatusCard title="Total Agents" value={summaryData.totalAgents} icon={Users} />
      <StatusCard title="Active" value={summaryData.activeAgents} icon={UserCheck} color="text-accent" />
      <StatusCard title="On Break" value={summaryData.onBreak} icon={Coffee} color="text-yellow-500" />
      <StatusCard title="On Lunch" value={summaryData.onLunch} icon={Briefcase} color="text-blue-500" />
       <StatusCard title="Offline" value={summaryData.offline} icon={UserX} color="text-slate-500" />
      <StatusCard title="Out of Adherence" value={summaryData.outOfAdherence} icon={AlertTriangle} color="text-destructive" />
    </div>
  );
}
