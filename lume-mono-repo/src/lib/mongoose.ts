import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

interface GlobalMongoose {
    mongoose?: {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
    };
}

let cached = (global as GlobalMongoose).mongoose || {
    conn: null,
    promise: null,
};

if (!cached) {
    cached = (global as GlobalMongoose).mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectToDatabase() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                dbName: "lumeDB",
                bufferCommands: false,
            })
            .catch((err) => {
                console.error("MongoDB connection error:", err);
                throw err;
            });
    }

    cached.conn = await cached.promise;
    console.log("--- Connected to MongoDB ---");

    return cached.conn;
}
