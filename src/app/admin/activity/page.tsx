import { ActivityChart } from "@/components/admin/ActivityChart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminActivityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Activity Visualization</h1>
        <p className="text-muted-foreground">Analyze agent activity patterns through charts and graphs.</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-headline">Filters</CardTitle>
              <CardDescription>Select criteria to refine activity data.</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select defaultValue="weekly">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="alpha">Team Alpha</SelectItem>
                  <SelectItem value="bravo">Team Bravo</SelectItem>
                  <SelectItem value="charlie">Team Charlie</SelectItem>
                </SelectContent>
              </Select>
              <Button>Apply Filters</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <ActivityChart />

      {/* Placeholder for more charts */}
      {/*
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Daily Trends</CardTitle></CardHeader>
          <CardContent><p>Chart for daily activity trends...</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Agent Comparison</CardTitle></CardHeader>
          <CardContent><p>Chart comparing activity across agents...</p></CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
