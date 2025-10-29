import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Note from '@/models/Note';
import User from '@/models/User';
import connectToDB from '@/lib/dbConnect';

interface NoteRequestBody {
  content: string;
  shift: string; // Assuming shift ID is a string
}

export async function GET(req: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shiftId = searchParams.get('shiftId');

    if (!shiftId) {
      return NextResponse.json({ message: 'Shift ID is required' }, { status: 400 });
    }

    const notes = await Note.find({ shift: shiftId }).populate('author', 'fullName image initials');
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

interface NoteRequestBody {
  content: string;
  shift: string; // Assuming shift ID is a string
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { content, shift } = (await req.json()) as NoteRequestBody;
    if (!content || !shift) {
      return NextResponse.json({ message: 'Content and shift are required' }, { status: 400 });
    }
    // session.user.id may not be present depending on adapter/session configuration.
    // Try to use it, otherwise look up the user by email.
    let authorId = (session as any).user?.id;
    if (!authorId) {
      const email = (session as any).user?.email;
      if (email) {
        const user = await User.findOne({ email }).select('_id');
        if (user) authorId = user._id;
      }
    }

    if (!authorId) {
      return NextResponse.json({ message: 'Could not determine note author from session' }, { status: 400 });
    }

    const newNote = new Note({
      content,
      shift,
      author: authorId,
    });

    await newNote.save();
    const populatedNote = await Note.findById(newNote._id).populate('author', 'fullName image initials');

    return NextResponse.json(populatedNote, { status: 201 });
  } catch (error: any) {
    console.error('Error creating note:', error);
    // If it's a validation error from Mongoose, return 400 with details
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors, _message: error._message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}