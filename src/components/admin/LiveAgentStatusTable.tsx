
"use client";

import { useEffect, useState } from "react";
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, orderBy, type Timestamp } from 'firebase/firestore';
import type { AgentStatusFirestore } from "@/lib/types";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, WifiOff, AlertCircle, Pencil } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';
import { updateAgentDisplayName } from "@/app/actions/updateAgentDisplayName";
import { useToast } from "@/hooks/use-toast";

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Clocked In - Working") return "default";
  if (status === "On Lunch" || status === "On Break" || status === "On Bathroom Break") return "secondary";
  if (status === "Clocked Out" || status === "Offline") return "outline";
  return "default";
}

export function LiveAgentStatusTable() {
  const [liveAgents, setLiveAgents] = useState<AgentStatusFirestore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "agentStatuses"), orderBy("lastUpdate", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const agents: AgentStatusFirestore[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as AgentStatusFirestore;
        if (data.currentStatus !== "Clocked Out" && data.currentStatus !== "Offline") {
          agents.push({ ...data, id: doc.id } as any); 
        }
      });
      setLiveAgents(agents);
      setIsLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching live agent statuses:", err);
      setError("Failed to load live agent statuses.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditName = async (agentId: string, currentDisplayName: string | null | undefined) => {
    const newName = window.prompt("Enter new display name (leave blank to clear):", currentDisplayName || "");
    if (newName === null) return; // User cancelled

    const result = await updateAgentDisplayName(agentId, newName);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      // Firestore listener should update the table automatically
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading live agent statuses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (liveAgents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <WifiOff className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-lg font-medium text-foreground">No Active Agents</p>
        <p className="text-muted-foreground">There are currently no agents clocked in or on active status.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Agent Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liveAgents.map((agent) => (
            <TableRow key={agent.agentId} className="hover:bg-muted/50">
              <TableCell>
                <Image 
                  src={agent.photoURL || "https://placehold.co/40x40.png"} 
                  alt={agent.adminDisplayName || agent.agentName || "Agent"} 
                  width={32} 
                  height={32} 
                  className="rounded-full"
                  data-ai-hint="profile person" 
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {agent.adminDisplayName || agent.agentName || 'N/A'}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleEditName(agent.agentId, agent.adminDisplayName || agent.agentName)}
                    title="Edit display name"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(agent.currentStatus)}>
                  {agent.currentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {agent.lastUpdate ? formatDistanceToNowStrict(agent.lastUpdate.toDate(), { addSuffix: true }) : 'N/A'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{agent.agentEmail || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
