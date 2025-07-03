import { isMongoId } from "validator";
import { z } from "zod";

export const borrowSchema = z.object({
  book: z.string().refine((val) => isMongoId(val), {
    message: "Invalid mongo db object id format",
  }),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1"),
  dueDate: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .refine((date) => date > new Date(), {
      message: "Due date must be in the future",
    }),
});
