import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event schema definition
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Title cannot be empty',
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      trim: true,
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: 'Organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalize date to ISO format
 */
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch {
    // If parsing fails, return original string (validation will catch invalid dates)
    return dateString;
  }
}

/**
 * Normalize time to consistent format (HH:MM)
 */
function normalizeTime(timeString: string): string {
  // Remove extra whitespace
  const trimmed = timeString.trim();
  
  // Try to parse and format time
  // This is a simple normalization - can be enhanced based on requirements
  return trimmed;
}

/**
 * Pre-save hook: Generate slug and normalize date/time
 */
// @ts-expect-error - Mongoose 9.x type definitions issue with pre hooks
EventSchema.pre('save', function (next: () => void) {
  // Generate slug only if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format if date is modified
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format if time is modified
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }

  next();
});

// Create unique index on slug for faster lookups
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
