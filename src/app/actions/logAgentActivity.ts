
'use server';

import { google } from 'googleapis';
import { z } from 'zod';
import type { AgentActivityType } from '@/lib/types';

const LogAgentActivityInputSchema = z.object({
  userId: z.string().min(1),
  userEmail: z.string().email().nullable(),
  userName: z.string().nullable(),
  activityType: z.custom<AgentActivityType>(),
  timestamp: z.string().datetime(),
  statusMessage: z.string(),
});

type LogAgentActivityInput = z.infer<typeof LogAgentActivityInputSchema>;

export async function logAgentActivity(
  input: LogAgentActivityInput
): Promise<{ success: boolean; message: string }> {
  try {
    const validationResult = LogAgentActivityInputSchema.safeParse(input);
    if (!validationResult.success) {
      console.error('Invalid input for logAgentActivity:', validationResult.error.flatten());
      return { success: false, message: `Invalid input: ${validationResult.error.flatten().fieldErrors}` };
    }

    const { userId, userEmail, userName, activityType, timestamp, statusMessage } = validationResult.data;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      console.error('Google Sheets API credentials or Sheet ID are not configured in .env');
      return { success: false, message: 'Server configuration error for Google Sheets.' };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const range = 'Sheet1!A:F'; // Assuming Sheet1 and columns A-F. Adjust as needed.
    // Columns: Timestamp, Agent ID, Agent Email, Agent Name, Activity Type, Status Message
    const values = [[timestamp, userId, userEmail ?? '', userName ?? '', activityType, statusMessage]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return { success: true, message: 'Activity logged to Google Sheet.' };
  } catch (error) {
    console.error('Error logging activity to Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to log activity: ${errorMessage}` };
  }
}
