
'use server';

import { google, sheets_v4 } from 'googleapis'; // Added sheets_v4
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

const EXPECTED_HEADERS = ['Timestamp', 'Agent ID', 'Agent Email', 'Agent Name', 'Activity Type', 'Status Message'];

async function ensureSheetHeaders(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<void> { // Typed 'sheets'
  try {
    const headerRange = 'Sheet1!A1:F1';
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    const currentHeaders = getResponse.data.values?.[0];
    let headersMatch = false;
    if (currentHeaders && currentHeaders.length > 0) {
      headersMatch = currentHeaders.every((header: string, index: number) => header === EXPECTED_HEADERS[index]);
    }

    if (!headersMatch) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1', // Update starting from A1, it will overwrite enough cells for the new headers
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [EXPECTED_HEADERS],
        },
      });
      console.log('Google Sheet headers written/updated.');
    }
  } catch (error) {
    console.error('Error ensuring Google Sheet headers:', error);
    // We'll let the main function handle the error reporting to the user
    // but throw it so it can be caught by the main try-catch block.
    throw new Error(`Failed to ensure sheet headers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function logAgentActivity(
  input: LogAgentActivityInput
): Promise<{ success: boolean; message: string }> {
  try {
    const validationResult = LogAgentActivityInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.flatten();
      console.error('Invalid input for logAgentActivity:', errorDetails);
      // Concatenate field errors for a more informative message
      let errorMessage = "Invalid input: ";
      for (const field in errorDetails.fieldErrors) {
        // @ts-ignore
        errorMessage += `${field}: ${errorDetails.fieldErrors[field]?.join(', ')}; `;
      }
      return { success: false, message: errorMessage.trim() };
    }

    const { userId, userEmail, userName, activityType, timestamp, statusMessage } = validationResult.data;

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
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Ensure headers are present
    await ensureSheetHeaders(sheets, spreadsheetId);

    const dataAppendRange = 'Sheet1!A:F'; // Append to the whole sheet, it will find the next empty row in A:F
    const valuesToAppend = [[timestamp, userId, userEmail ?? '', userName ?? '', activityType, statusMessage]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: dataAppendRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', // This is better for appending
      requestBody: {
        values: valuesToAppend,
      },
    });

    return { success: true, message: 'Activity logged to Google Sheet.' };
  } catch (error) {
    console.error('Error logging activity to Google Sheet:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to log activity: ${errorMessage}` };
  }
}
