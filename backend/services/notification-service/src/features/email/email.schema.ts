import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.email(),
  subject: z.string().trim().min(1).max(200),
  text: z.string().min(1),
  html: z.string().min(1).optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
