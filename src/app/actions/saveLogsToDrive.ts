
'use server';

import { google } from 'googleapis';
import { Readable } from 'stream';
import { getAgentLogsForDate, type AgentLogEntry } from '@/app/actions/getTodaysAgentLogs'; // Adjusted import
import { format } from "date-fns";

// Helper function to convert array of objects to CSV string
function convertToCSV(data: AgentLogEntry[]): string {
  if (!data || data.length === 0) {
    return '';
  }
  const headers = ["Timestamp", "Agent Name", "Agent Email", "Activity Type", "Status Message"];
  const csvRows = [
    headers.join(','),
    ...data.map(log => [
      `"${log.timestamp.replace(/"/g, '""')}"`,
      `"${(log.agentName || 'N/A').replace(/"/g, '""')}"`,
      `"${(log.agentEmail || 'N/A').replace(/"/g, '""')}"`,
      `"${log.activityType.replace(/"/g, '""')}"`,
      `"${log.statusMessage.replace(/"/g, '""')}"`
    ].join(','))
  ];
  return csvRows.join('\n');
}

export async function saveLogsToDrive(
  dateString?: string,
  filterAgentId?: string,
  filterAgentName?: string // For filename
): Promise<{ success: boolean; message: string; fileLink?: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Though not directly used, implies config presence
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!serviceAccountEmail || !privateKey || !driveFolderId) {
      const missing = [
        !serviceAccountEmail && "GOOGLE_SERVICE_ACCOUNT_EMAIL",
        !privateKey && "GOOGLE_PRIVATE_KEY",
        !driveFolderId && "GOOGLE_DRIVE_FOLDER_ID"
      ].filter(Boolean).join(", ");
      console.error(`Server configuration error for Google Drive. Missing: ${missing}`);
      return { success: false, message: `Server configuration error for Google Drive. Please check .env variables for: ${missing}` };
    }

    // Fetch logs
    const logsResponse = await getAgentLogsForDate(dateString, filterAgentId);
    if (!logsResponse.success || !logsResponse.data || logsResponse.data.length === 0) {
      return { success: false, message: logsResponse.message || 'No logs found to save.' };
    }

    const csvData = convertToCSV(logsResponse.data);
    if (!csvData) {
      return { success: false, message: 'Failed to generate CSV data (no logs).' };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      // Added drive.file scope. You might need to ensure this scope is enabled for the service account or project.
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const dateForFilename = dateString ? format(new Date(dateString), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    const agentIdentifier = filterAgentId === "all" || !filterAgentName ? "all_agents" : filterAgentName.replace(/\s+/g, '_').toLowerCase();
    const fileName = `agent_activity_logs_${agentIdentifier}_${dateForFilename}.csv`;

    const fileMetadata = {
      name: fileName,
      parents: [driveFolderId],
      mimeType: 'text/csv',
    };

    const media = {
      mimeType: 'text/csv',
      body: Readable.from([csvData]), // Convert string to Readable stream
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink', // Get file ID and webViewLink back
    });

    return {
      success: true,
      message: `Successfully saved logs to Google Drive as "${fileName}".`,
      fileLink: file.data.webViewLink || undefined,
    };
  } catch (error) {
    console.error('Error saving logs to Google Drive:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to save logs to Drive: ${errorMessage}` };
  }
}
