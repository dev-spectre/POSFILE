import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-pos';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Make sure MongoDB is running or provide MONGODB_URI');
    console.log('📌 To start MongoDB locally:');
    console.log('   mongod --dbpath "C:\\data\\db"');
    console.log('');
    console.log('📌 Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    
    // Don't exit, let the server continue (will fail on DB operations)
    setTimeout(() => {
      connectDB(); // Retry connection
    }, 5000);
  }
};

export default connectDB;
