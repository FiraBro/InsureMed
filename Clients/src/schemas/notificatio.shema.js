import { z } from "zod";

export const notificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(3),
  message: z.string().min(5),
  type: z.enum(["email", "push", "in-app"]),
});
