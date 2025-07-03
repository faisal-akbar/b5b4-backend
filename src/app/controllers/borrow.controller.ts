import { Request, Response, Router } from "express";
import { Book } from "../models/books.models";
import { borrowSchema } from "../schemas/borrow.schema";
import { formatZodError } from "../utils/formatZodError";
import { Borrow } from "../models/borrow.models";
import { IBorrowCreate } from "../interfaces/borrow.interface";

export const borrowRoutes = Router();

// POST /api/borrow
borrowRoutes.post("/", async (req: Request, res: Response) => {
  const parseBody = await borrowSchema.safeParseAsync(req.body);

  if (!parseBody.success) {
    const errorResponse = formatZodError(parseBody.error, req.body);
    res.status(400).json(errorResponse);
    return;
  }
  try {
    const { book, quantity, dueDate } = parseBody.data as IBorrowCreate

    // Check if the book exists and has enough copies available
    const bookRecord = await Book.findById(book);
    if (!bookRecord) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
      return;
    }

    // Verify the book has enough available copies.
    if (bookRecord.copies < quantity) {
      res.status(400).json({
        success: false,
        message: "Not enough copies available",
      });
      return;
    }
      
    // update copies and available status
    Book.updateBookCopiesAndAvailable(bookRecord, quantity);

    // Save the borrow record with all relevant details.
    const borrow = await Borrow.create({
      book: bookRecord._id,
      quantity,
      dueDate: new Date(dueDate),
    });

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: borrow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error borrowing book",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});


// GET /api/borrow
borrowRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const borrowedBooks = await Borrow.aggregate([
      {
        $group: {
          _id: "$book",
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 0,
          book: {
            title: "$bookDetails.title",
            isbn: "$bookDetails.isbn",
          },
          totalQuantity: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Borrowed books summary retrieved successfully",
      data: borrowedBooks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving borrowed books summary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
);