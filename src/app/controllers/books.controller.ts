import express, { Request, Response, Router } from "express";
import { Book } from "../models/books.models";
import {
  bookParamsSchema,
  bookSchema,
  bookUpdateSchema,
  querySchema,
} from "../schemas/books.schema";
import { formatZodError } from "../utils/formatZodError";
import { IReqQuery } from "../interfaces/books.interface";

export const booksRoutes: Router = express.Router();

// Create Book
booksRoutes.post("/", async (req: Request, res: Response) => {
  const parseBody = await bookSchema.safeParseAsync(req.body);
  if (!parseBody.success) {
    const errorResponse = formatZodError(parseBody.error, req.body);
    res.status(400).json(errorResponse);
    return;
  }

  try {
    const book = await Book.create(parseBody.data);
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating book",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get All Books or by provided query parameters
booksRoutes.get("/", async (req: Request, res: Response) => {
  try {
    // If no query parameters are provided, return all books
    if (Object.keys(req.query).length === 0) {
      const books = await Book.find({});
      res.status(200).json({
        success: true,
        message: "Books retrieved successfully",
        data: books,
      });
      return;
    }

    // zod validation:
    const parseResult = querySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorResponse = formatZodError(parseResult.error, req.query);
      res.status(400).json(errorResponse);
      return;
    }

    const { filter, sortBy, sort, limit = 10 } = parseResult.data as IReqQuery;

    // Build query based on filter and sort and limit query parameters
    const query: Record<string, any> = {};
    if (filter) {
      query.genre = filter.toUpperCase();
    }

    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy) {
      sortOptions[sortBy] = sort === "desc" ? -1 : 1;
    }

    // If no sortBy is provided, default to sorting by title in ascending order
    const books = await Book.find(query).sort(sortOptions).limit(Number(limit));

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching books",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get Book by ID
booksRoutes.get("/:bookId", async (req: Request, res: Response) => {
  const parseParams = bookParamsSchema.safeParse(req.params);
  if (!parseParams.success) {
    const errorResponse = formatZodError(parseParams.error, req.params);
    res.status(400).json(errorResponse);
    return;
  }
  const bookId = req.params.bookId;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving book",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update Book by bookId
booksRoutes.put("/:bookId", async (req: Request, res: Response) => {
  const parseParams = bookParamsSchema.safeParse(req.params);
  if (!parseParams.success) {
    const errorResponse = formatZodError(parseParams.error, req.params);
    res.status(400).json(errorResponse);
    return;
  }

  const parseBody = await bookUpdateSchema.safeParseAsync(req.body);
  console.log("parseBody", req.body);
  if (!parseBody.success) {
    const errorResponse = formatZodError(parseBody.error, req.body);
    console.log("parseBody error", errorResponse);
    res.status(400).json(errorResponse);
    return;
  }

  const bookId = req.params.bookId;
  try {
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId },
      parseBody.data,
      { new: true, runValidators: true }
    );
    if (!updatedBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating book",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Delete Book by bookId
booksRoutes.delete("/:bookId", async (req: Request, res: Response) => {
  const parseParams = bookParamsSchema.safeParse(req.params);
  if (!parseParams.success) {
    const errorResponse = formatZodError(parseParams.error, req.params);
    res.status(400).json(errorResponse);
    return;
  }

  const bookId = req.params.bookId;
  try {
    const deletedBook = await Book.findOneAndDelete({ _id: bookId });
    if (!deletedBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: deletedBook,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting book",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
