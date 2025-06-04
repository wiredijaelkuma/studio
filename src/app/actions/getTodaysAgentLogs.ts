
'use server';

import { google } from 'googleapis';
import { z } from 'zod';

const LogEntrySchema = z.object({
  timestamp: z.string(),
  agentId: z.string(),
  agentEmail: z.string().optional().nullable(),
  agentName: z.string().optional().nullable(),
  activityType: z.string(),
  statusMessage: z.string(),
});

export type AgentLogEntry = z.infer<typeof LogEntrySchema>;

// Function to get the start and end of a given day in UTC ISO string format
const getDateRangeForDay = (dateString?: string) => {
  const date = dateString ? new Date(dateString) : new Date();
  date.setUTCHours(0, 0, 0, 0); // Start of the day in UTC
  const startOfDay = date.toISOString();

  const endOfDayDate = new Date(date);
  endOfDayDate.setUTCHours(23, 59, 59, 999); // End of the day in UTC
  const endOfDay = endOfDayDate.toISOString();
  
  return { startOfDay, endOfDay };
};


export async function getAgentLogsForDate(dateString?: string): Promise<{ success: boolean; data?: AgentLogEntry[]; message: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      console.error('Google Sheets API credentials or Sheet ID are not configured in .env');
      return { success: false, message: 'Server configuration error for Google Sheets. Please check .env variables.' };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Readonly scope
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const range = 'Sheet1!A:F'; 
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return { success: true, data: [], message: 'No logs found in the sheet.' };
    }

    const headerRow = rows[0];
    const expectedHeaders = ['Timestamp', 'Agent ID', 'Agent Email', 'Agent Name', 'Activity Type', 'Status Message'];
    // Basic check for first header
    if (headerRow[0] !== expectedHeaders[0]) {
        console.warn("Sheet headers might not match expected. Assuming order: Timestamp, Agent ID, Agent Email, Agent Name, Activity Type, Status Message");
    }
    
    const logs: AgentLogEntry[] = [];
    const { startOfDay, endOfDay } = getDateRangeForDay(dateString);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 6) continue; 

      const logTimestampISO = row[0]; 
      
      if (logTimestampISO && typeof logTimestampISO === 'string' && !isNaN(new Date(logTimestampISO).getTime())) {
        // Compare ISO strings directly for UTC dates
        if (logTimestampISO >= startOfDay && logTimestampISO <= endOfDay) {
          const entry: AgentLogEntry = {
            // Display timestamp in local time for readability
            timestamp: new Date(logTimestampISO).toLocaleString(), 
            agentId: row[1] || '',
            agentEmail: row[2] || '',
            agentName: row[3] || '',
            activityType: row[4] || '',
            statusMessage: row[5] || '',
          };
          logs.push(entry);
        }
      } else {
        console.warn(`Skipping row ${i+1} due to invalid or missing timestamp: ${logTimestampISO}`);
      }
    }

    return { success: true, data: logs.reverse(), message: 'Successfully fetched logs for the selected date.' };
  } catch (error) {
    console.error('Error fetching logs from Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to fetch logs: ${errorMessage}` };
  }
}
