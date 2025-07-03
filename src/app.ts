import express, { Application, NextFunction, Request, Response } from 'express';
import { booksRoutes } from './app/controllers/books.controller';
import { borrowRoutes } from './app/controllers/borrow.controller';
import cors from 'cors';


const app: Application = express();
app.use(cors());

app.use(express.json())


app.use("/api/books", booksRoutes)
app.use("/api/borrow", borrowRoutes)


app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Library Management API with Express, TypeScript & MongoDB');
});

// 404 Not Found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
 res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


export default app;