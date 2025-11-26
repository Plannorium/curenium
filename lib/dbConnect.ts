import mongoose from 'mongoose';

// Import all models to ensure they are registered with Mongoose
import '@/models/Admission';
import '@/models/Alert';
import '@/models/Appointment';
import '@/models/Attachment';
import '@/models/AuditLog';
import '@/models/CallSession';
import '@/models/Channel';
import '@/models/ClinicalNote';
import '@/models/DMRoom';
import '@/models/Department';
import '@/models/Discharge';
import '@/models/Encounter';
import '@/models/Insurance';
import '@/models/Invite';
import '@/models/LabOrder';
import '@/models/LabResult';
import '@/models/Medication';
import '@/models/Message';
import '@/models/Note';
import '@/models/Notification';
import '@/models/NursingCarePlan';
import '@/models/Organization';
import '@/models/Patient';
import '@/models/Prescription';
import '@/models/Shift';
import '@/models/User';
import '@/models/Vital';
import '@/models/Ward';

declare global {
  // allow global `var` declarations
  var mongooseCache: {
    promise: Promise<typeof mongoose> | null;
    conn: typeof mongoose | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('Connected to MongoDB');
            return mongoose;
        }).catch((error) => {
            console.error('MongoDB connection error:', error);
            cached.promise = null; // Reset promise on error
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null; // Reset promise on error
        throw error;
    }
}

export default dbConnect;