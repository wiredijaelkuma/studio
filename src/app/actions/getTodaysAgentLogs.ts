
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

// Function to get the start and end of today in UTC ISO string format
const getTodayDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today in local time
  const startOfToday = today.toISOString();

  const endOfTodayDate = new Date(today);
  endOfTodayDate.setHours(23, 59, 59, 999); // End of today in local time
  const endOfToday = endOfTodayDate.toISOString();
  
  return { startOfToday, endOfToday };
};


export async function getTodaysAgentLogs(): Promise<{ success: boolean; data?: AgentLogEntry[]; message: string }> {
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

    // Assuming data is in 'Sheet1' and headers are in the first row.
    // We fetch a reasonable range, e.g., first 1000 rows. Adjust if you expect more daily logs.
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
    const headersMatch = headerRow.every((header, index) => header === expectedHeaders[index]);

    if (!headersMatch) {
        console.warn("Sheet headers do not match expected. Assuming order: Timestamp, Agent ID, Agent Email, Agent Name, Activity Type, Status Message");
        // Potentially return error or attempt to process based on assumed order.
        // For now, we'll proceed assuming the order is correct even if headers are different.
    }
    
    const logs: AgentLogEntry[] = [];
    const { startOfToday, endOfToday } = getTodayDateRange();

    // Start from the second row (index 1) to skip headers
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Ensure row has enough columns to prevent errors
      if (row.length < 6) continue; 

      const logTimestamp = row[0]; // Assuming Timestamp is in the first column
      
      // Basic check if logTimestamp is a valid date string before parsing
      if (logTimestamp && typeof logTimestamp === 'string' && !isNaN(new Date(logTimestamp).getTime())) {
        if (logTimestamp >= startOfToday && logTimestamp <= endOfToday) {
          const entry: AgentLogEntry = {
            timestamp: new Date(logTimestamp).toLocaleString(), // Format for display
            agentId: row[1] || '',
            agentEmail: row[2] || '',
            agentName: row[3] || '',
            activityType: row[4] || '',
            statusMessage: row[5] || '',
          };
          logs.push(entry);
        }
      } else {
        console.warn(`Skipping row ${i+1} due to invalid or missing timestamp: ${logTimestamp}`);
      }
    }

    return { success: true, data: logs.reverse(), message: 'Successfully fetched today\'s logs.' }; // Reverse to show newest first
  } catch (error) {
    console.error('Error fetching logs from Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to fetch logs: ${errorMessage}` };
  }
}
