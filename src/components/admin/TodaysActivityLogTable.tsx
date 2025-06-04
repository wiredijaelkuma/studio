
"use client";

import type { AgentLogEntry } from "@/app/actions/getTodaysAgentLogs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TodaysActivityLogTableProps {
  logs: AgentLogEntry[];
}

export function TodaysActivityLogTable({ logs }: TodaysActivityLogTableProps) {
  if (!logs || logs.length === 0) {
    return <p className="text-muted-foreground">No activities logged for today yet.</p>;
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-md">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Agent Name</TableHead>
            <TableHead>Agent Email</TableHead>
            <TableHead>Activity Type</TableHead>
            <TableHead>Status Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell>{log.timestamp}</TableCell>
              <TableCell className="font-medium">{log.agentName || 'N/A'}</TableCell>
              <TableCell>{log.agentEmail || 'N/A'}</TableCell>
              <TableCell>{log.activityType}</TableCell>
              <TableCell>{log.statusMessage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
