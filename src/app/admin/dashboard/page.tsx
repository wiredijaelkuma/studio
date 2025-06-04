import { AgentStatusSummary } from "@/components/admin/AgentStatusSummary";
import { AdherenceAlertsTable } from "@/components/admin/AdherenceAlertsTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of agent activity and adherence.</p>
      </div>

      <AgentStatusSummary />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Out-of-Adherence Alerts</CardTitle>
          <CardDescription>Agents currently flagged for adherence issues.</CardDescription>
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
