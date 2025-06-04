
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAgentLogsForDate, type AgentLogEntry } from "@/app/actions/getTodaysAgentLogs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ListChecks, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function AgentActivityLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date();

  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      setError(null);
      getAgentLogsForDate(today.toISOString(), user.uid)
        .then(response => {
          if (response.success) {
            setLogs(response.data || []);
          } else {
            setError(response.message);
            setLogs([]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch agent logs:", err);
          setError("An unexpected error occurred while fetching your activity.");
          setLogs([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setLogs([]);
    }
  }, [user, today]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-headline">My Activity Today ({format(today, "PPP")})</CardTitle>
        </div>
        <CardDescription>A log of your recorded activities for the current day.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Loading your activity...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
            <AlertCircle className="h-5 w-5" />
            <p>Error: {error}</p>
          </div>
        )}
        {!isLoading && !error && logs.length === 0 && (
          <p className="text-muted-foreground p-4 text-center">No activities logged for you today.</p>
        )}
        {!isLoading && !error && logs.length > 0 && (
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={`${log.timestamp}-${index}`} className="hover:bg-muted/50">
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.activityType}</TableCell>
                    <TableCell>{log.statusMessage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
