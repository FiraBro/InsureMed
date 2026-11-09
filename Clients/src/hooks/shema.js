import * as z from "zod";

export const planSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  premium: z.coerce.number().min(0, "Premium must be positive"),
  coverageAmount: z.coerce.number().min(0, "Coverage must be positive"),
  deductible: z.coerce.number().default(500),
  currency: z.string().default("USD"),
  premiumFrequency: z.enum(["monthly", "quarterly", "annually"]),
  planType: z.string().default("individual"),
  category: z.string().default("Health Insurance"),
  shortDescription: z.string().max(160, "Keep it under 160 chars"),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  maxMembers: z.coerce.number().min(1),
  minAge: z.coerce.number().min(0),
  maxAge: z.coerce.number().max(100),
  isPopular: z.boolean().default(false),
  status: z.string().default("published"),
});
