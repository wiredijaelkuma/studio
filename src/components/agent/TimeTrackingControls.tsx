"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, LogIn, LogOut, Sandwich, Coffee, UserRound, Waves, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AgentActivityType } from "@/lib/types";

interface ActivityState {
  status: string;
  lastAction?: AgentActivityType;
  isClockedIn: boolean;
  isOnLunch: boolean;
  isOnBreak: boolean;
  isBathroom: boolean;
}

export function TimeTrackingControls() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activityState, setActivityState] = useState<ActivityState>({
    status: "Clocked Out",
    isClockedIn: false,
    isOnLunch: false,
    isOnBreak: false,
    isBathroom: false,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleActivity = (type: AgentActivityType, message: string, newStatus: string) => {
    // Here you would typically send data to a backend/Firebase
    console.log(`Activity: ${type} at ${new Date().toISOString()}`);
    
    setActivityState(prevState => {
      let nextState = { ...prevState, lastAction: type, status: newStatus };
      switch (type) {
        case 'clock-in':
          nextState.isClockedIn = true;
          break;
        case 'clock-out':
          nextState.isClockedIn = false;
          nextState.isOnLunch = false; // Auto-end lunch/break on clock-out
          nextState.isOnBreak = false;
          nextState.isBathroom = false;
          break;
        case 'lunch-start':
          nextState.isOnLunch = true;
          break;
        case 'lunch-end':
          nextState.isOnLunch = false;
          break;
        case 'break-start':
          nextState.isOnBreak = true;
          break;
        case 'break-end':
          nextState.isOnBreak = false;
          break;
        case 'bathroom-start':
          nextState.isBathroom = true;
          break;
        case 'bathroom-end':
          nextState.isBathroom = false;
          break;
      }
      return nextState;
    });

    toast({
      title: "Activity Logged",
      description: `${message} at ${new Date().toLocaleTimeString()}`,
      action: <ToastAction altText="Undo">Undo</ToastAction>,
    });
  };
  
  const ToastAction = ({ altText, children }: { altText: string; children: React.ReactNode }) => (
    <Button variant="outline" size="sm" onClick={() => console.log("Undo action triggered")}>
      {children}
    </Button>
  );


  const CurrentStatusIndicator = () => {
    let IconComponent = AlertCircle;
    let textColor = "text-destructive-foreground";
    let bgColor = "bg-destructive";

    if (activityState.isClockedIn) {
      if (activityState.isOnLunch) {
        IconComponent = Sandwich;
        textColor = "text-primary-foreground";
        bgColor = "bg-primary/80";
      } else if (activityState.isOnBreak) {
        IconComponent = Coffee;
        textColor = "text-primary-foreground";
        bgColor = "bg-primary/80";
      } else if (activityState.isBathroom) {
        IconComponent = Waves;
        textColor = "text-primary-foreground";
        bgColor = "bg-primary/80";
      } else {
        IconComponent = CheckCircle2;
        textColor = "text-accent-foreground";
        bgColor = "bg-accent";
      }
    }

    return (
      <div className={`p-4 rounded-lg mb-6 shadow-md flex items-center justify-center gap-3 ${bgColor} ${textColor}`}>
        <IconComponent className="h-8 w-8" />
        <span className="text-2xl font-semibold">{activityState.status}</span>
      </div>
    );
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <Clock className="h-12 w-12 mx-auto text-primary mb-2" />
        <CardTitle className="text-3xl font-headline">Time Tracking</CardTitle>
        <CardDescription className="text-lg">
          Current Time: {currentTime.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <CurrentStatusIndicator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!activityState.isClockedIn ? (
            <Button 
              size="lg" 
              className="py-8 text-xl bg-accent hover:bg-accent/90 text-accent-foreground col-span-full"
              onClick={() => handleActivity("clock-in", "Clocked In", "Clocked In - Working")}
            >
              <LogIn className="mr-2 h-6 w-6" /> Clock In
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="lg" 
              className="py-8 text-xl col-span-full"
              onClick={() => handleActivity("clock-out", "Clocked Out", "Clocked Out")}
            >
              <LogOut className="mr-2 h-6 w-6" /> Clock Out
            </Button>
          )}
        </div>

        {activityState.isClockedIn && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!activityState.isOnLunch ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg"
                  disabled={activityState.isOnBreak || activityState.isBathroom}
                  onClick={() => handleActivity("lunch-start", "Started Lunch", "On Lunch")}
                >
                  <Sandwich className="mr-2 h-5 w-5" /> Start Lunch
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleActivity("lunch-end", "Ended Lunch", "Clocked In - Working")}
                >
                  <Sandwich className="mr-2 h-5 w-5" /> End Lunch
                </Button>
              )}

              {!activityState.isOnBreak ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg"
                  disabled={activityState.isOnLunch || activityState.isBathroom}
                  onClick={() => handleActivity("break-start", "Started Break", "On Break")}
                >
                  <Coffee className="mr-2 h-5 w-5" /> Start Break
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleActivity("break-end", "Ended Break", "Clocked In - Working")}
                >
                  <Coffee className="mr-2 h-5 w-5" /> End Break
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1">
             {!activityState.isBathroom ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg w-full"
                  disabled={activityState.isOnLunch || activityState.isOnBreak}
                  onClick={() => handleActivity("bathroom-start", "Bathroom Break Started", "On Bathroom Break")}
                >
                  <Waves className="mr-2 h-5 w-5" /> Bathroom
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg w-full border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleActivity("bathroom-end", "Bathroom Break Ended", "Clocked In - Working")}
                >
                  <Waves className="mr-2 h-5 w-5" /> End Bathroom
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
