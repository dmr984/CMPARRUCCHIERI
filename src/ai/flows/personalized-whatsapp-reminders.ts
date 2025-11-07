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
  customerName: z.string().describe("Nome del cliente"),
  appointmentDateTime: z.string().describe("Data e ora dell'appuntamento"),
  salonName: z.string().describe("Nome del salone"),
  customerPreferences: z
    .string()
    .optional()
    .describe("Preferenze del cliente o informazioni aggiuntive"),
  phoneNumber: z.string().describe("Numero di telefono del cliente per WhatsApp"),
});

export type PersonalizedWhatsappReminderInput = z.infer<
  typeof PersonalizedWhatsappReminderInputSchema
>;

const PersonalizedWhatsappReminderOutputSchema = z.object({
  message: z.string().describe("Messaggio WhatsApp personalizzato"),
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
  prompt: `Sei un esperto nella scrittura di messaggi SMS personalizzati per promemoria di appuntamenti.

  In base alle seguenti informazioni, genera un messaggio WhatsApp personalizzato per ricordare al cliente il suo prossimo appuntamento.

  Nome Cliente: {{{customerName}}}
  Data/Ora Appuntamento: {{{appointmentDateTime}}}
  Nome Salone: {{{salonName}}}
  @optional Preferenze Cliente: {{{customerPreferences}}}

  Il messaggio deve essere amichevole, conciso, includere tutti i dettagli necessari e progettato per ridurre le mancate presentazioni.
  Dovrebbe anche essere adattato alle preferenze del cliente, se disponibili.
  Assicurati di iniziare il messaggio con il nome del cliente.
  Includi il nome del salone nel messaggio.
  Includi la data e l'ora dell'appuntamento.
  Rispondi in italiano.
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
