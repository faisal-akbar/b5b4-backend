import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

// Ensure mongoose connects only once (for serverless environments like Vercel)
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(config.database_url as string);
    isConnected = true;
  }
}

async function main() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`App is listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();