import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database';

/**
 * GET /api/events/[slug]
 * Fetches event details by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    // Resolve params (Next.js 15+ uses Promise-based params)
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid slug parameter. Slug is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Normalize slug (trim and lowercase)
    const normalizedSlug = slug.trim().toLowerCase();

    // Connect to database
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug: normalizedSlug });

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { error: `Event with slug "${normalizedSlug}" not found.` },
        { status: 404 }
      );
    }

    // Convert Mongoose document to plain object
    const eventData = event.toObject();

    // Return event data
    return NextResponse.json(eventData, { status: 200 });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error fetching event by slug:', error);

    // Check if error is a known validation error
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { error: 'Database configuration error. Please check server configuration.' },
          { status: 500 }
        );
      }

      // Mongoose validation errors
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Invalid request data. Please check your input.' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the event.' },
      { status: 500 }
    );
  }
}
