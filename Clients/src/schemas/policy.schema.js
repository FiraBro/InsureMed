import { z } from "zod";

export const policySchema = z.object({
  policyNumber: z.string(),
  status: z.enum([
    "active",
    "expired",
    "pending_renewal",
    "renewed",
    "cancelled",
  ]),
  startDate: z.string(),
  endDate: z.string(),
  premium: z.number(),
  currency: z.string(),
});
