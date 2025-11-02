// src/ai/flows/personalized-whatsapp-reminders.ts
'use server';

/**
 * @fileOverview Flow for sending personalized WhatsApp appointment reminders.
 *
 * - personalizedWhatsappReminder - Sends a personalized WhatsApp reminder.
 * - PersonalizedWhatsappReminderInput - Input type for personalizedWhatsappReminder.
 * - PersonalizedWhatsappReminderOutput - Output type for personalizedWhatsappReminder.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWhatsappReminderInputSchema = z.object({
  customerName: z.string().describe('Customer name'),
  appointmentDateTime: z.string().describe('Date and time of the appointment'),
  serviceDetails: z.string().describe('Details of the service booked'),
  salonName: z.string().describe('Name of the salon'),
  customerPreferences: z
    .string()
    .optional()
    .describe('Customer preferences or additional information'),
  phoneNumber: z.string().describe('Customer phone number for WhatsApp'),
});

export type PersonalizedWhatsappReminderInput = z.infer<
  typeof PersonalizedWhatsappReminderInputSchema
>;

const PersonalizedWhatsappReminderOutputSchema = z.object({
  message: z.string().describe('Personalized WhatsApp message'),
});

export type PersonalizedWhatsappReminderOutput = z.infer<
  typeof PersonalizedWhatsappReminderOutputSchema
>;

export async function personalizedWhatsappReminder(
  input: PersonalizedWhatsappReminderInput
): Promise<PersonalizedWhatsappReminderOutput> {
  return personalizedWhatsappReminderFlow(input);
}

const personalizedWhatsappReminderPrompt = ai.definePrompt({
  name: 'personalizedWhatsappReminderPrompt',
  input: {
    schema: PersonalizedWhatsappReminderInputSchema,
  },
  output: {
    schema: PersonalizedWhatsappReminderOutputSchema,
  },
  prompt: `You are an expert at writing personalized SMS messages for appointment reminders.

  Based on the following information, generate a personalized WhatsApp message to remind the customer of their upcoming appointment.

  Customer Name: {{{customerName}}}
  Appointment Date/Time: {{{appointmentDateTime}}}
  Service Details: {{{serviceDetails}}}
  Salon Name: {{{salonName}}}
  @optional Customer Preferences: {{{customerPreferences}}}

  The message should be friendly, concise, and include all necessary details, and designed to reduce no-shows.
  It should also be tailored to the customer preferences, if available.
  Make sure to start the message with the customer's name.
  Include the salon name in the message.
  Include the date and time of the appointment.
  Include the service that will be provided.
`,
});

const personalizedWhatsappReminderFlow = ai.defineFlow(
  {
    name: 'personalizedWhatsappReminderFlow',
    inputSchema: PersonalizedWhatsappReminderInputSchema,
    outputSchema: PersonalizedWhatsappReminderOutputSchema,
  },
  async input => {
    const {output} = await personalizedWhatsappReminderPrompt(input);
    // TODO: Add code to actually send the WhatsApp message here.  This will require a 3rd party service and API key.
    return {
      message: output!.message,
    };
  }
);
