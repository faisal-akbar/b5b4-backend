import { isMongoId } from "validator";
import { z } from "zod";
import { Book } from "../models/books.models";

export const GENRES = [
  "FICTION",
  "NON_FICTION",
  "SCIENCE",
  "HISTORY",
  "BIOGRAPHY",
  "FANTASY",
] as const;

const baseBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.enum(
    GENRES,
    {
      message: "Genre must be one of the predefined values",
    }
  ),
  isbn: z.string().refine(async (isbn) => {
    const isISBN = await Book.findOne({ isbn });
    return !isISBN;
  }, "ISBN already exists"),
  description: z.string().optional(),
  copies: z.number().min(0, "Copies must be a positive number"),
  available: z.boolean().default(true),
});

export const bookSchema = baseBookSchema.superRefine((data, ctx) => {
  if (data.copies === 0 && data.available) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "If copies are 0, available must be false",
      path: ["available"],
    });
  } else if (data.copies > 0 && !data.available) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "If copies are more than 0, available must be true",
      path: ["available"],
    });
  }
});

export const bookUpdateSchema = baseBookSchema.partial().superRefine((data, ctx) => {
  // Only validate if both fields are present in the update
  if (
    typeof data.copies === "number" &&
    typeof data.available === "boolean"
  ) {
    if (data.copies > 0 && data.available === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot set available to false when copies is more than 0",
        path: ["available"],
      });
    }
    if (data.copies === 0 && data.available === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "If copies are 0, available must be false",
        path: ["available"],
      });
    }
  }
});


export const querySchema = z.object({
  filter: z.string().optional().refine((val) => {
    return !val || GENRES.includes(val.toUpperCase() as typeof GENRES[number]);
  }, {
    message: `Filter must be one of the predefined genres: ${GENRES.join(", ")}`,
  }),
  sortBy: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z
    .string()
    .transform(Number)
    .refine((val) => val > 0, {
      message: "Limit must be a positive number",
    })
    .optional()
    .default("10"),
    page: z
    .string()
    .transform(Number)
    .refine((val) => val > 0, {
      message: "Page must be a positive number",
    })
    .optional()
    .default("1"),
});

export const bookParamsSchema = z.object({
  bookId: z
    .string()
    .refine((val) => isMongoId(val), {
      message: "Invalid mongo db object id format",
    })
});
