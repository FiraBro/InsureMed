import { z } from "zod";

export const applicationSchema = z.object({
  planId: z.string().min(1),

  personal: z.object({
    fullName: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(6),
    dob: z.string(),
    address: z.string().optional(),
  }),

  nominee: z
    .object({
      name: z.string().min(3),
      relationship: z.string().min(2),
    })
    .optional(),

  medical: z
    .object({
      history: z.string().optional(),
      otherDetails: z.string().optional(),
    })
    .optional(),

  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    )
    .min(1),

  payment: z.object({
    frequency: z.enum(["monthly", "quarterly", "annually"]),
    method: z.string(),
  }),

  agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree to terms" }),
  }),
});
