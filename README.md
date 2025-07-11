## Library Management API with Express, TypeScript & MongoDB
This project is a simple library management API built using Express, TypeScript, and MongoDB. It provides endpoints for managing books, and borrow records.

### Live API Entry Point
You can access the live API at [https://b5b4-backend.vercel.app/](https://b5b4-backend.vercel.app/).

### Features:
- Type-safe API with TypeScript
- Input validation using zod for request bodies and query parameters, ensuring data integrity.
- CRUD operations for books and create borrow records and aggregation summary reports for borrowed books
- static method for update available status of books
- pre hook for updating the available status when book copies update to 0 or more than 0.
- post hook to delete borrow records when book is deleted.
- Pagination for book listings

### Technologies Used
- Node.js
- Express.js
- TypeScript
- zod
- MongoDB
- Mongoose
- dotenv

### How to Run the Project Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/faisal-akbar/b5b4-backend.git
   ```
2. Navigate to the project directory:
   ```bash
    cd b5b4-backend
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```
4. Create a `.env` file in the root directory and add your MongoDB connection string:
    ```plaintext
    DATABASE_URL=mongodb://localhost:27017/library

    OR

    DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/library?retryWrites=true&w=majority

    replace <username> and <password> with your MongoDB credentials.
    ```
5. Start the development server:
    ```bash
    npm run dev
    ```
6. The API will be running on `http://localhost:5000`.

### API Endpoints
- **Books**
  - `GET /api/books`: Get all books,, and can be adjusted with query parameters for pagination, sorting, and filtering and limiting.
    - Example: `/api/books?filter=FANTASY&sortBy=createdAt&sort=desc&limit=5&page=1`
  - `POST /api/books`: Create a new book
  - `GET /api/books/:bookId`: Get a book by ID
  - `PUT /api/books/:bookId`: Update a book by ID
  - `DELETE /api/books/:bookId`: Delete a book by ID
- **Borrow Records**
  - `POST /api/borrow`: Create a new borrow record
  - `GET GET /api/borrow`: Get Borrowed Books Summary (Using Aggregation)
