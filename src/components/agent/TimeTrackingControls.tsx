
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, LogIn, LogOut, Sandwich, Coffee, UserRound, Waves, CheckCircle2, AlertCircle, Loader2, UserCircle2, BellRing } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AgentActivityType } from "@/lib/types";
import { useAuth } from '@/contexts/AuthContext';
import { logAgentActivity } from '@/app/actions/logAgentActivity';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, Timestamp, collection, addDoc } from 'firebase/firestore';
import type { AdherenceViolationFirestore } from '@/lib/types';


// Configuration for activity limits and notifications
const LUNCH_DURATION_MINUTES = 30;
const BREAK_DURATION_MINUTES = 15;
const NOTIFICATION_GRACE_PERIOD_MINUTES = 5; // Agent gets notified after base duration + grace period

const MAX_LUNCH_COUNT = 1;
const MAX_BREAK_COUNT = 2;
const MAX_BATHROOM_COUNT = 5;

interface ActivityCounts {
  lunch: number;
  break: number;
  bathroom: number;
}

type CurrentActivityDetailType = 'lunch' | 'break' | 'bathroom' | null;

interface ActivityState {
  status: string;
  lastAction?: AgentActivityType;
  isClockedIn: boolean;
  isOnLunch: boolean;
  isOnBreak: boolean;
  isBathroom: boolean;
  activityCounts: ActivityCounts;
  currentActivityTypeForFirestore: CurrentActivityDetailType;
}

export function TimeTrackingControls() {
  const { toast } = useToast();
  const { user, loading: authLoading, signInWithGoogle, signOut: firebaseSignOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const initialActivityState: ActivityState = {
    status: "Clocked Out",
    isClockedIn: false,
    isOnLunch: false,
    isOnBreak: false,
    isBathroom: false,
    activityCounts: { lunch: 0, break: 0, bathroom: 0 },
    currentActivityTypeForFirestore: null,
  };
  const [activityState, setActivityState] = useState<ActivityState>(initialActivityState);
  const [isLogging, setIsLogging] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  const lunchNotificationTimer = useRef<NodeJS.Timeout | null>(null);
  const breakNotificationTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      clearAllNotificationTimers();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setActivityState(initialActivityState);
      clearAllNotificationTimers();
    } else {
       setActivityState(prevState => ({
        ...initialActivityState,
        status: prevState.isClockedIn ? prevState.status : "Clocked Out",
        isClockedIn: prevState.isClockedIn,
        lastAction: prevState.lastAction, // Preserve lastAction if user re-authenticates mid-session
        activityCounts: prevState.isClockedIn ? prevState.activityCounts : initialActivityState.activityCounts,
        currentActivityTypeForFirestore: prevState.isClockedIn ? prevState.currentActivityTypeForFirestore : null,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: "Notifications Enabled", description: "You'll be notified for overdue breaks/lunch." });
        } else {
          toast({ variant: "destructive", title: "Notifications Denied", description: "You won't receive desktop reminders." });
        }
        return permission;
      }
      return Notification.permission;
    }
    return 'denied';
  };

  const showDesktopNotification = (title: string, body: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' }); 
    }
  };

  const logAdherenceViolation = async (type: 'lunch' | 'break', statusWhenTriggered: string) => {
    if (!user) return;

    const violationData: AdherenceViolationFirestore = {
      agentId: user.uid,
      agentName: user.displayName,
      agentEmail: user.email,
      photoURL: user.photoURL,
      activityType: type,
      violationTimestamp: Timestamp.now(),
      expectedDurationMinutes: type === 'lunch' ? LUNCH_DURATION_MINUTES : BREAK_DURATION_MINUTES,
      gracePeriodMinutes: NOTIFICATION_GRACE_PERIOD_MINUTES,
      statusWhenTriggered: statusWhenTriggered,
    };

    try {
      await addDoc(collection(db, 'adherenceViolations'), violationData);
      console.log(`Adherence violation logged for ${type}`);
    } catch (error) {
      console.error("Error logging adherence violation to Firestore:", error);
    }
  };

  const clearAllNotificationTimers = () => {
    if (lunchNotificationTimer.current) clearTimeout(lunchNotificationTimer.current);
    if (breakNotificationTimer.current) clearTimeout(breakNotificationTimer.current);
    lunchNotificationTimer.current = null;
    breakNotificationTimer.current = null;
  };

  const scheduleNotification = (type: 'lunch' | 'break') => {
    clearAllNotificationTimers(); 

    const duration = type === 'lunch' ? LUNCH_DURATION_MINUTES : BREAK_DURATION_MINUTES;
    const totalDurationMs = (duration + NOTIFICATION_GRACE_PERIOD_MINUTES) * 60 * 1000;
    
    const timerId = setTimeout(() => {
      // Capture current state directly using a functional update to get the latest state
      setActivityState(currentInternalState => {
        if ((type === 'lunch' && currentInternalState.isOnLunch) || (type === 'break' && currentInternalState.isOnBreak)) {
          showDesktopNotification(
            `${type.charAt(0).toUpperCase() + type.slice(1)} Overdue`,
            `Your ${type} time is up. Please return to work.`
          );
          logAdherenceViolation(type, currentInternalState.status);
        }
        return currentInternalState; // No state change, just using for check
      });
    }, totalDurationMs);

    if (type === 'lunch') {
      lunchNotificationTimer.current = timerId;
    } else {
      breakNotificationTimer.current = timerId;
    }
  };


  const updateFirestoreStatus = async (
    newStatus: string, 
    activityTypeForFirestore: CurrentActivityDetailType,
    isStartingActivity: boolean
  ) => {
    if (!user) return;
    try {
      const statusDocRef = doc(db, 'agentStatuses', user.uid);
      const dataToSet: any = {
        agentId: user.uid,
        agentEmail: user.email,
        agentName: user.displayName,
        photoURL: user.photoURL,
        currentStatus: newStatus,
        lastUpdate: serverTimestamp(),
        currentActivityType: activityTypeForFirestore,
      };

      if (isStartingActivity && (activityTypeForFirestore === 'lunch' || activityTypeForFirestore === 'break' || activityTypeForFirestore === 'bathroom')) {
        dataToSet.activityStartTime = serverTimestamp();
      } else {
        dataToSet.activityStartTime = null; 
      }

      await setDoc(statusDocRef, dataToSet, { merge: true });
    } catch (error) {
      console.error("Error updating Firestore status:", error);
      toast({
        variant: "destructive",
        title: "Firestore Update Failed",
        description: "Could not update your status in real-time system.",
      });
    }
  };

  const handleActivity = async (type: AgentActivityType, message: string, newStatus: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Signed In", description: "Please sign in to log activity." });
      return;
    }

    if (type === 'lunch-start' && activityState.activityCounts.lunch >= MAX_LUNCH_COUNT) {
      toast({ variant: "destructive", title: "Limit Reached", description: `You can only take ${MAX_LUNCH_COUNT} lunch break(s).` });
      return;
    }
    if (type === 'break-start' && activityState.activityCounts.break >= MAX_BREAK_COUNT) {
      toast({ variant: "destructive", title: "Limit Reached", description: `You can only take ${MAX_BREAK_COUNT} short break(s).` });
      return;
    }
    if (type === 'bathroom-start' && activityState.activityCounts.bathroom >= MAX_BATHROOM_COUNT) {
      toast({ variant: "destructive", title: "Limit Reached", description: `You have used all ${MAX_BATHROOM_COUNT} bathroom breaks.` });
      return;
    }

    setIsLogging(true);
    let newActivityTypeForFirestore: CurrentActivityDetailType = null;
    let isStartingTimedActivity = false;
    let finalStatusForFirestore = newStatus; 

    switch (type) {
      case 'clock-in': newActivityTypeForFirestore = null; isStartingTimedActivity = false; break;
      case 'clock-out': newActivityTypeForFirestore = null; isStartingTimedActivity = false; break;
      case 'lunch-start': newActivityTypeForFirestore = 'lunch'; isStartingTimedActivity = true; break;
      case 'lunch-end': newActivityTypeForFirestore = null; isStartingTimedActivity = false; finalStatusForFirestore = "Clocked In - Working"; break;
      case 'break-start': newActivityTypeForFirestore = 'break'; isStartingTimedActivity = true; break;
      case 'break-end': newActivityTypeForFirestore = null; isStartingTimedActivity = false; finalStatusForFirestore = "Clocked In - Working"; break;
      case 'bathroom-start': newActivityTypeForFirestore = 'bathroom'; isStartingTimedActivity = true; break;
      case 'bathroom-end': newActivityTypeForFirestore = null; isStartingTimedActivity = false; finalStatusForFirestore = "Clocked In - Working"; break;
    }


    try {
      const activityData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        activityType: type,
        timestamp: new Date().toISOString(),
        statusMessage: newStatus, 
      };
      
      const result = await logAgentActivity(activityData);

      if (result.success) {
        setActivityState(prevState => {
          let updatedActivityState: ActivityState;

          switch (type) {
            case 'clock-in':
              updatedActivityState = {
                ...prevState,
                status: newStatus,
                lastAction: type,
                isClockedIn: true,
                activityCounts: { lunch: 0, break: 0, bathroom: 0 },
                currentActivityTypeForFirestore: null,
              };
              break;
            case 'clock-out':
              updatedActivityState = {
                ...initialActivityState, // Reset to initial state
                lastAction: type,        // Explicitly set lastAction
                status: "Clocked Out",   // Ensure status is correct from initial state
              };
              clearAllNotificationTimers();
              break;
            case 'lunch-start':
              updatedActivityState = {
                ...prevState,
                status: newStatus,
                lastAction: type,
                isOnLunch: true,
                activityCounts: { ...prevState.activityCounts, lunch: prevState.activityCounts.lunch + 1 },
                currentActivityTypeForFirestore: 'lunch',
              };
              scheduleNotification('lunch');
              break;
            case 'lunch-end':
              updatedActivityState = {
                ...prevState,
                status: "Clocked In - Working",
                lastAction: type,
                isOnLunch: false,
                currentActivityTypeForFirestore: null,
              };
              if (lunchNotificationTimer.current) clearTimeout(lunchNotificationTimer.current);
              lunchNotificationTimer.current = null;
              break;
            case 'break-start':
              updatedActivityState = {
                ...prevState,
                status: newStatus,
                lastAction: type,
                isOnBreak: true,
                activityCounts: { ...prevState.activityCounts, break: prevState.activityCounts.break + 1 },
                currentActivityTypeForFirestore: 'break',
              };
              scheduleNotification('break');
              break;
            case 'break-end':
              updatedActivityState = {
                ...prevState,
                status: "Clocked In - Working",
                lastAction: type,
                isOnBreak: false,
                currentActivityTypeForFirestore: null,
              };
              if (breakNotificationTimer.current) clearTimeout(breakNotificationTimer.current);
              breakNotificationTimer.current = null;
              break;
            case 'bathroom-start':
              updatedActivityState = {
                ...prevState,
                status: newStatus,
                lastAction: type,
                isBathroom: true,
                activityCounts: { ...prevState.activityCounts, bathroom: prevState.activityCounts.bathroom + 1 },
                currentActivityTypeForFirestore: 'bathroom',
              };
              break;
            case 'bathroom-end':
              updatedActivityState = {
                ...prevState,
                status: "Clocked In - Working",
                lastAction: type,
                isBathroom: false,
                currentActivityTypeForFirestore: null,
              };
              break;
            default:
              // This case should ideally not be reached if 'type' is correctly constrained
              // but as a fallback, return previous state to avoid errors.
              console.warn("Unhandled activity type in setActivityState:", type);
              updatedActivityState = prevState; 
              break;
          }
          return updatedActivityState;
        });

        toast({
          title: "Activity Logged",
          description: `${message} at ${new Date().toLocaleTimeString()}. Data sent to sheet.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sheet Logging Failed",
          description: result.message || "Could not log activity to Google Sheet.",
        });
      }
    } catch (error) {
      console.error("Error in handleActivity (Sheet Logging):", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while logging activity to sheet.",
      });
    } finally {
      setIsLogging(false);
    }
    
    await updateFirestoreStatus(finalStatusForFirestore, newActivityTypeForFirestore, isStartingTimedActivity);
  };
  
  const handleSignOut = async () => {
    if (user && activityState.isClockedIn) {
       await handleActivity("clock-out", "Clocked Out before Sign Out", "Clocked Out");
    }
    await updateFirestoreStatus("Offline", null, false); 
    await firebaseSignOut(); 
  };


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
    } else if (activityState.status === "Clocked Out"){
        IconComponent = LogOut;
        textColor = "text-muted-foreground";
        bgColor = "bg-muted";
    }


    return (
      <div className={`p-4 rounded-lg mb-6 shadow-md flex items-center justify-center gap-3 ${bgColor} ${textColor}`}>
        <IconComponent className="h-8 w-8" />
        <span className="text-2xl font-semibold">{activityState.status}</span>
      </div>
    );
  };

  if (authLoading) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="flex flex-col justify-center items-center h-64 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center p-6">
          <UserCircle2 className="h-16 w-16 mx-auto text-primary mb-3" />
          <CardTitle className="text-2xl font-headline">Sign In Required</CardTitle>
          <CardDescription className="text-md mt-1">
            Please sign in with your Google account to track your work activities.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6 pt-2">
          <Button onClick={signInWithGoogle} size="lg" className="text-lg py-3 w-full sm:w-auto">
            <LogIn className="mr-2 h-5 w-5" /> Sign in with Google
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="profile person"/>
              <AvatarFallback className="text-xl">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserRound />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-headline">{user.displayName || 'Agent'}</CardTitle>
              {user.email && <CardDescription className="text-sm text-muted-foreground">{user.email}</CardDescription>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notificationPermission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window && (
              <Button variant="outline" size="sm" onClick={requestNotificationPermission} title="Enable Desktop Notifications">
                <BellRing className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut} size="sm" disabled={isLogging}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
        <div className="text-center border-t pt-4">
          <Clock className="h-10 w-10 mx-auto text-primary mb-1" />
          <p className="text-lg">
            Current Time: {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6 pt-0">
        <CurrentStatusIndicator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!activityState.isClockedIn ? (
            <Button 
              size="lg" 
              className="py-8 text-xl bg-accent hover:bg-accent/90 text-accent-foreground col-span-full"
              onClick={() => handleActivity("clock-in", "Clocked In", "Clocked In - Working")}
              disabled={isLogging}
            >
              {isLogging && activityState.lastAction === 'clock-in' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <LogIn className="mr-2 h-6 w-6" />}
               Clock In
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="lg" 
              className="py-8 text-xl col-span-full"
              onClick={() => handleActivity("clock-out", "Clocked Out", "Clocked Out")}
              disabled={isLogging || activityState.isOnLunch || activityState.isOnBreak || activityState.isBathroom}
            >
              {isLogging && activityState.lastAction === 'clock-out' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <LogOut className="mr-2 h-6 w-6" />}
               Clock Out
            </Button>
          )}
        </div>

        {activityState.isClockedIn && (
          <div className="space-y-4 pt-4 border-t">
            <CardDescription className="text-center text-sm">
                Lunch: {activityState.activityCounts.lunch}/{MAX_LUNCH_COUNT} | 
                Breaks: {activityState.activityCounts.break}/{MAX_BREAK_COUNT} | 
                Bathroom: {activityState.activityCounts.bathroom}/{MAX_BATHROOM_COUNT}
            </CardDescription>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!activityState.isOnLunch ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg"
                  disabled={activityState.isOnBreak || activityState.isBathroom || isLogging || activityState.activityCounts.lunch >= MAX_LUNCH_COUNT}
                  onClick={() => handleActivity("lunch-start", "Started Lunch", "On Lunch")}
                >
                  {isLogging && activityState.lastAction === 'lunch-start' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sandwich className="mr-2 h-5 w-5" />}
                   Start Lunch
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg border-primary text-primary hover:bg-primary/10"
                  disabled={isLogging}
                  onClick={() => handleActivity("lunch-end", "Ended Lunch", "Clocked In - Working")}
                >
                  {isLogging && activityState.lastAction === 'lunch-end' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sandwich className="mr-2 h-5 w-5" />}
                   End Lunch
                </Button>
              )}

              {!activityState.isOnBreak ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg"
                  disabled={activityState.isOnLunch || activityState.isBathroom || isLogging || activityState.activityCounts.break >= MAX_BREAK_COUNT}
                  onClick={() => handleActivity("break-start", "Started Break", "On Break")}
                >
                  {isLogging && activityState.lastAction === 'break-start' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Coffee className="mr-2 h-5 w-5" />}
                   Start Break
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg border-primary text-primary hover:bg-primary/10"
                  disabled={isLogging}
                  onClick={() => handleActivity("break-end", "Ended Break", "Clocked In - Working")}
                >
                  {isLogging && activityState.lastAction === 'break-end' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Coffee className="mr-2 h-5 w-5" />}
                   End Break
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1">
             {!activityState.isBathroom ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg w-full"
                  disabled={activityState.isOnLunch || activityState.isOnBreak || isLogging || activityState.activityCounts.bathroom >= MAX_BATHROOM_COUNT}
                  onClick={() => handleActivity("bathroom-start", "Bathroom Break Started", "On Bathroom Break")}
                >
                  {isLogging && activityState.lastAction === 'bathroom-start' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Waves className="mr-2 h-5 w-5" />}
                   Bathroom
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="py-6 text-lg w-full border-primary text-primary hover:bg-primary/10"
                  disabled={isLogging}
                  onClick={() => handleActivity("bathroom-end", "Bathroom Break Ended", "Clocked In - Working")}
                >
                  {isLogging && activityState.lastAction === 'bathroom-end' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Waves className="mr-2 h-5 w-5" />}
                   End Bathroom
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


    