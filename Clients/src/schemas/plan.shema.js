import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(3),

  premium: z.number().positive(),
  coverageAmount: z.number().positive(),
  deductible: z.number().min(0),

  currency: z.string().default("USD"),

  premiumFrequency: z.enum(["monthly", "quarterly", "annually"]),

  description: z.string().optional(),
  shortDescription: z.string().optional(),
  coverage: z.string().optional(),

  planType: z.enum(["INDIVIDUAL", "FAMILY", "CORPORATE"]),
  category: z.string(),

  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),

  maxMembers: z.number().min(1),
  minAge: z.number().min(0),
  maxAge: z.number().max(120),

  waitingPeriod: z.string().optional(),
  networkSize: z.string().optional(),

  renewalBonus: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),

  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),

  icon: z.string().optional(),
  colorScheme: z.string().optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),

  status: z.enum(["DRAFT", "PUBLISHED"]),
});
