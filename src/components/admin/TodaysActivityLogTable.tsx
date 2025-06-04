
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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface TodaysActivityLogTableProps {
  logs: AgentLogEntry[];
}

export function TodaysActivityLogTable({ logs }: TodaysActivityLogTableProps) {

  const downloadCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = ["Timestamp", "Agent Name", "Agent Email", "Activity Type", "Status Message"];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        `"${log.timestamp.replace(/"/g, '""')}"`, // Escape double quotes
        `"${(log.agentName || 'N/A').replace(/"/g, '""')}"`,
        `"${(log.agentEmail || 'N/A').replace(/"/g, '""')}"`,
        `"${log.activityType.replace(/"/g, '""')}"`,
        `"${log.statusMessage.replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `agent_activity_logs_${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (!logs || logs.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No activities logged for today yet.</p>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={downloadCSV} variant="outline" size="sm" disabled={!logs || logs.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>
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
              <TableRow key={index} className="hover:bg-muted/so">
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
    </div>
  );
}

