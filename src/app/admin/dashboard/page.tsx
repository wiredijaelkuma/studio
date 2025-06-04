
import { AgentStatusSummary } from "@/components/admin/AgentStatusSummary";
import { AdherenceAlertsTable } from "@/components/admin/AdherenceAlertsTable";
import { TodaysActivityLogTable } from "@/components/admin/TodaysActivityLogTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTodaysAgentLogs, type AgentLogEntry } from "@/app/actions/getTodaysAgentLogs";
import { AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
  const { success, data: todaysLogs, message } = await getTodaysAgentLogs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of agent activity and adherence.</p>
      </div>

      <AgentStatusSummary />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Today's Activity Log</CardTitle>
          <CardDescription>Raw activity logs from agents for the current day.</CardDescription>
        </CardHeader>
        <CardContent>
          {!success && (
            <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
              <AlertTriangle className="h-5 w-5" />
              <p>Error fetching today's logs: {message}</p>
            </div>
          )}
          {success && todaysLogs && <TodaysActivityLogTable logs={todaysLogs} />}
          {success && (!todaysLogs || todaysLogs.length === 0) && (
             <p className="text-muted-foreground p-4 text-center">No activities logged for today yet.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Out-of-Adherence Alerts (Mock Data)</CardTitle>
          <CardDescription>Agents currently flagged for adherence issues. (Currently using mock data)</CardDescription>
        </CardHeader>
        <CardContent>
          <AdherenceAlertsTable />
        </CardContent>
      </Card>
      
      {/* Placeholder for more dashboard widgets */}
      {/*
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
          <CardContent><p>List of recent agent activities...</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Team Performance Snapshot</CardTitle></CardHeader>
          <CardContent><p>Key performance indicators for teams...</p></CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
