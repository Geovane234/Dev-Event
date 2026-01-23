import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import Event, { IEvent } from './event.model';

/**
 * Interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking schema definition
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          // Basic email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook: Validate that the referenced event exists
 */
// @ts-expect-error - Mongoose 9.x type definitions issue with pre hooks
BookingSchema.pre('save', async function (next: (err?: Error) => void) {
  // Only validate if eventId is modified or document is new
  if (this.isModified('eventId') || this.isNew) {
    try {
      const event = await Event.findById(this.eventId);
      if (!event) {
        const error = new Error(
          `Event with ID ${this.eventId} does not exist`
        ) as Error & { statusCode?: number };
        error.statusCode = 404;
        return next(error);
      }
    } catch (error) {
      return next(error instanceof Error ? error : new Error(String(error)));
    }
  }
  next();
});

// Create index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

/**
 * Booking model
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
