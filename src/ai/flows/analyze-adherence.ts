// src/ai/flows/analyze-adherence.ts

'use server';

/**
 * @fileOverview Analyzes agent activity to detect out-of-adherence instances.
 *
 * - analyzeAdherence - Analyzes agent activity patterns to identify potential out-of-adherence instances.
 * - AnalyzeAdherenceInput - The input type for the analyzeAdherence function.
 * - AnalyzeAdherenceOutput - The return type for the analyzeAdherence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAdherenceInputSchema = z.object({
  agentActivityData: z
    .string()
    .describe('A string containing agent activity data, including timestamps and activity types (e.g., lunch, break, bathroom, in/out).'),
  expectedSchedule: z
    .string()
    .describe('A string containing the agent’s expected schedule for the analyzed period.'),
  adherenceThreshold: z
    .number()
    .describe('A number representing the maximum allowed deviation from the expected schedule, in minutes.'),
});

export type AnalyzeAdherenceInput = z.infer<typeof AnalyzeAdherenceInputSchema>;

const AnalyzeAdherenceOutputSchema = z.object({
  isOutOfAdherence: z
    .boolean()
    .describe('A boolean indicating whether the agent is out of adherence.'),
  reason: z
    .string()
    .describe('A string explaining the reason for the out-of-adherence status, if applicable.'),
});

export type AnalyzeAdherenceOutput = z.infer<typeof AnalyzeAdherenceOutputSchema>;

export async function analyzeAdherence(input: AnalyzeAdherenceInput): Promise<AnalyzeAdherenceOutput> {
  return analyzeAdherenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAdherencePrompt',
  input: {schema: AnalyzeAdherenceInputSchema},
  output: {schema: AnalyzeAdherenceOutputSchema},
  prompt: `You are an AI assistant specializing in workforce management and adherence monitoring. Analyze the agent's activity data against their expected schedule to identify any out-of-adherence instances. An agent is considered out-of-adherence if their actual activity deviates from their expected schedule by more than the specified threshold.

Agent Activity Data:
{{agentActivityData}}

Expected Schedule:
{{expectedSchedule}}

Adherence Threshold (minutes):
{{adherenceThreshold}}

Determine if the agent is out of adherence and provide a clear reason for your determination. Be brief and to the point.
`,
});

const analyzeAdherenceFlow = ai.defineFlow(
  {
    name: 'analyzeAdherenceFlow',
    inputSchema: AnalyzeAdherenceInputSchema,
    outputSchema: AnalyzeAdherenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
