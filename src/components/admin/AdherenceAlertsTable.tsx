"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const mockAlerts = [
  { id: "1", agentName: "Alice Smith", avatar: "https://placehold.co/40x40.png", team: "Alpha", lastActivity: "Late from Lunch", deviation: "15 mins", details: "Expected back at 1:00 PM, returned at 1:15 PM" },
  { id: "2", agentName: "Bob Johnson", avatar: "https://placehold.co/40x40.png", team: "Bravo", lastActivity: "Extended Break", deviation: "10 mins", details: "Took a 25-min break instead of 15 mins" },
  { id: "3", agentName: "Carol Williams", avatar: "https://placehold.co/40x40.png", team: "Alpha", lastActivity: "Late Clock-In", deviation: "8 mins", details: "Clocked in at 9:08 AM instead of 9:00 AM" },
];

export function AdherenceAlertsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]"></TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Deviation</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockAlerts.map((alert) => (
          <TableRow key={alert.id} className="hover:bg-muted/50">
            <TableCell>
               <Image src={alert.avatar} alt={alert.agentName} width={40} height={40} className="rounded-full" data-ai-hint="profile person" />
            </TableCell>
            <TableCell className="font-medium">{alert.agentName}</TableCell>
            <TableCell>{alert.team}</TableCell>
            <TableCell>
              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                <AlertTriangle className="h-3 w-3" />
                {alert.lastActivity}
              </Badge>
            </TableCell>
            <TableCell>{alert.deviation}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" aria-label="View details">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
