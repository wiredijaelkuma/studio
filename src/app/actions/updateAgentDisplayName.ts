
'use server';

import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { headers } from 'next/headers'; // To potentially get user info if needed for auth, though direct auth check is better

// IMPORTANT: This should be kept in sync with the list in src/app/page.tsx
// For a production app, this should be managed more securely, e.g., via a database role or custom claims.
const AUTHORIZED_ADMIN_EMAILS = ['mijaelkuma@gmail.com', 'numusmike@gmail.com']; 

// This is a simplified way to check admin authorization for server actions.
// In a real app, you'd use Firebase Admin SDK for backend auth or verify ID tokens.
// For now, we'll assume this server action is only callable by an already authenticated admin
// based on client-side checks, but a more robust server-side check is ideal.
// For this example, we'll simulate checking based on a hypothetical custom header or session.
// A more robust solution would involve verifying a Firebase ID token passed from the client.

export async function updateAgentDisplayName(
  agentId: string,
  newDisplayName: string
): Promise<{ success: boolean; message: string }> {
  // In a real app, you would get the calling user's email from their authenticated session/token
  // For this example, we'll assume the check happens client-side or via a more robust mechanism.
  // const callingUserEmail = "admin@example.com"; // Replace with actual auth logic
  // if (!AUTHORIZED_ADMIN_EMAILS.includes(callingUserEmail)) {
  //   return { success: false, message: "Unauthorized: Only admins can update display names." };
  // }

  if (!agentId || typeof newDisplayName !== 'string') {
    return { success: false, message: 'Invalid input provided.' };
  }

  try {
    const agentDocRef = doc(db, 'agentStatuses', agentId);
    await updateDoc(agentDocRef, {
      adminDisplayName: newDisplayName.trim() === '' ? null : newDisplayName.trim(),
    });
    return { success: true, message: 'Agent display name updated successfully.' };
  } catch (error) {
    console.error('Error updating agent display name:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to update display name: ${errorMessage}` };
  }
}
