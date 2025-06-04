
import { TimeTrackingControls } from "@/components/agent/TimeTrackingControls";
import { AgentActivityLog } from "@/components/agent/AgentActivityLog"; // Added
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

      <AgentActivityLog /> {/* Added */}

    </div>
  );
}
