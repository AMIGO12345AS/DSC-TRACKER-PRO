'use server';

/**
 * @fileOverview Flow for customizing renewal notification content.
 *
 * - customizeRenewalNotification - A function that allows leaders to customize the content of renewal notifications.
 * - CustomizeRenewalNotificationInput - The input type for the customizeRenewalNotification function.
 * - CustomizeRenewalNotificationOutput - The return type for the customizeRenewalNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeRenewalNotificationInputSchema = z.object({
  emailTemplate: z
    .string()
    .describe('The new email template for renewal notifications.'),
  inAppTemplate: z
    .string()
    .describe('The new in-app notification template for renewal notifications.'),
  timing: z
    .number()
    .describe(
      'The timing for sending renewal notifications, in days before expiry.'
    ),
});
export type CustomizeRenewalNotificationInput = z.infer<
  typeof CustomizeRenewalNotificationInputSchema
>;

const CustomizeRenewalNotificationOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the customization was successful.'),
  message: z.string().describe('A message indicating the result of the customization.'),
});

export type CustomizeRenewalNotificationOutput = z.infer<
  typeof CustomizeRenewalNotificationOutputSchema
>;

export async function customizeRenewalNotification(
  input: CustomizeRenewalNotificationInput
): Promise<CustomizeRenewalNotificationOutput> {
  return customizeRenewalNotificationFlow(input);
}

const customizeRenewalNotificationPrompt = ai.definePrompt({
  name: 'customizeRenewalNotificationPrompt',
  input: {schema: CustomizeRenewalNotificationInputSchema},
  output: {schema: CustomizeRenewalNotificationOutputSchema},
  prompt: `You are an assistant that helps to customize renewal notification.

  Use the information to set the new notification content and the trigger time for sending the notification.

  Email template: {{{emailTemplate}}}
  In-app template: {{{inAppTemplate}}}
  Timing (days before expiry): {{{timing}}}

  Return a success status and a message indicating the result of the customization.
  `,
});

const customizeRenewalNotificationFlow = ai.defineFlow(
  {
    name: 'customizeRenewalNotificationFlow',
    inputSchema: CustomizeRenewalNotificationInputSchema,
    outputSchema: CustomizeRenewalNotificationOutputSchema,
  },
  async input => {
    // TODO: Implement the logic to save the customized notification content and timing
    // to a database or configuration file.
    // For now, we will just return a success message.
    const {output} = await customizeRenewalNotificationPrompt(input);
    return output!;
  }
);
