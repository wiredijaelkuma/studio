import { TimeTrackingControls } from "@/components/agent/TimeTrackingControls";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AgentDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Agent Dashboard</CardTitle>
          <CardDescription className="text-md">
            Manage your work status and track your activities easily.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <TimeTrackingControls />

      {/* Placeholder for future agent-specific information or quick links */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your schedule for today will appear here.</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
