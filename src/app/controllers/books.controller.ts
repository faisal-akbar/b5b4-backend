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
    // If no query parameters are provided, return 10 books by default
    if (Object.keys(req.query).length === 0) {
      const books = await Book.find({}).limit(10);
      const totalBooks = await Book.countDocuments({});
      
      res.status(200).json({
        success: true,
        message: "Books retrieved successfully",
        data: books,
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(totalBooks / 10),
          totalBooks,
          limit: 10,
          hasNextPage: totalBooks > 10,
          hasPrevPage: false,
        },
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

    const { filter, sortBy, sort, limit = 10, page = 1 } = parseResult.data as IReqQuery;

    // Build query based on filter
    const query: Record<string, any> = {};
    if (filter) {
      query.genre = filter.toUpperCase();
    }

    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy) {
      sortOptions[sortBy] = sort === "desc" ? -1 : 1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination info
    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    // Get books with pagination
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
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
