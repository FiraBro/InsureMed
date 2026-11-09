import { z } from "zod";

export const claimSchema = z.object({
  policyId: z.string().min(1),
  policyNumber: z.string().min(3),

  reason: z.string().min(5),
  claimType: z.string().min(3),

  amount: z.number().positive(),

  documentUrl: z.string().url(),
});
