import { model, Schema } from "mongoose";
import { IBooks, IBookStaticMethod } from "../interfaces/books.interface";
import { GENRES } from "../schemas/books.schema";
import { Borrow } from "./borrow.models";

const bookSchema = new Schema<IBooks, IBookStaticMethod>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      enum: GENRES,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    copies: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Static Method to update the available status based on copies
bookSchema.static("updateBookCopiesAndAvailable", async function (book, quantity) {
  // Deduct the requested quantity from the book’s copies.
  if (quantity > book.copies) {
    throw new Error("Not enough copies available");
  }
  book.copies -= quantity;
  // Update the available status based on the new copies count.
  book.available = book.copies > 0;
  await book.save();
});

// Query Middleware:
bookSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Record<string, any>;

  if (update && typeof update.copies !== "undefined") {
    if (update.copies === 0) {
      // Update `available` in the update object directly
      if (!update.$set) update.$set = {};
      update.$set.available = false;
    } else if (update.copies > 0) {
      // If copies are greater than 0, set available to true
      if (!update.$set) update.$set = {};
      update.$set.available = true;
    }
  }
  next();
});

// Query Middleware:
bookSchema.post("findOneAndDelete", async function (doc, next) {
  if (doc) {
    // If a book is deleted, ensure that no borrow records reference it
    await Borrow.deleteMany({ book: doc._id });
  }
  next();
});

export const Book = model<IBooks, IBookStaticMethod>("Book", bookSchema);
