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

const customizeRenewalNotificationFlow = ai.defineFlow(
  {
    name: 'customizeRenewalNotificationFlow',
    inputSchema: CustomizeRenewalNotificationInputSchema,
    outputSchema: CustomizeRenewalNotificationOutputSchema,
  },
  async (input) => {
    // In a real application, you would save these settings to a database.
    // For this demo, we simulate a successful save and generate a confirmation message.
    console.log('Updating notification settings:', input);

    // This is a simple example. A more complex flow could use an LLM to validate
    // or suggest improvements to the templates.
    const successMessage = `Successfully updated notification settings. Notifications will be sent ${input.timing} days before expiry.`;
    
    return {
      success: true,
      message: successMessage,
    };
  }
);
