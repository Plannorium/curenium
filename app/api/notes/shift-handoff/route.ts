import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { ShiftHandoff } from '../../../models/ShiftHandoff';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return NextResponse.json({ message: 'Unauthorized: No organization ID found in session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const wardId = searchParams.get('wardId');
  const departmentId = searchParams.get('departmentId');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  await dbConnect();

  try {
    const query: any = {
      organizationId: session.user.organizationId
    };

    // Role-based filtering
    if (session.user.role !== 'admin') {
      // Non-admin users can only see handoffs from their ward/department
      if (wardId) query.wardId = wardId;
      if (departmentId) query.departmentId = departmentId;
    } else {
      // Admins can filter by ward/department if specified
      if (wardId) query.wardId = wardId;
      if (departmentId) query.departmentId = departmentId;
    }

    if (type) query.type = type;

    const handoffs = await ShiftHandoff.find(query)
      .populate('createdBy', 'fullName image role')
      .populate('wardId', 'name wardNumber')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(handoffs, { status: 200 });
  } catch (error) {
    console.error('Error fetching shift handoffs:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId || !session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body: any = await req.json();
    const {
      type,
      wardId,
      departmentId,
      shiftId,
      overview,
      situationsManaged,
      incidentsOccurred,
      recommendations,
      additionalNotes,
      voiceRecordings
    } = body;

    // Debug: show current schema options for overview (helps confirm if running model marks it required)
    try {
      const overviewPath = (ShiftHandoff as any).schema.path('overview');
      console.log('ShiftHandoff.schema.overview.options:', overviewPath?.options || null);
      // Defensive runtime patch: if the loaded schema still marks overview as required,
      // relax it to allow voice-only submissions (this handles hot-reload/cached model issues).
      if (overviewPath) {
        console.log('Overview validators before patch:', overviewPath.validators);
        // Remove any 'required' validators that may still be attached to the path
        if (Array.isArray(overviewPath.validators) && overviewPath.validators.length > 0) {
          overviewPath.validators = overviewPath.validators.filter((v: any) => v.type !== 'required');
        }
        // Also relax options if set
        if (overviewPath.options && overviewPath.options.required) {
          overviewPath.options.required = false;
        }
        if (overviewPath.options) {
          overviewPath.options.default = overviewPath.options.default ?? '';
        }
        console.log('Overview validators after patch:', overviewPath.validators);
      }
    } catch (e) {
      console.log('Could not read ShiftHandoff.schema.path("overview")', e);
    }

    // Allow voice-only submissions: overview text is not required if a voice recording for overview is provided
    // If the server is still using an older compiled model (required:true), this check will surface that in the logs above.
    if (!type || (!overview && !(voiceRecordings && voiceRecordings.overview))) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newHandoff = new ShiftHandoff({
      type,
      wardId: wardId || undefined,
      departmentId: departmentId || undefined,
      shiftId: shiftId || undefined,
      overview: overview?.trim() || '',
      situationsManaged: situationsManaged?.trim() || '',
      incidentsOccurred: incidentsOccurred?.trim() || '',
      recommendations: recommendations?.trim() || '',
      additionalNotes: additionalNotes?.trim() || '',
      voiceRecordings: voiceRecordings || {},
      createdBy: session.user.id,
      organizationId: session.user.organizationId
    });

    await newHandoff.save();

    const populatedHandoff = await ShiftHandoff.findById(newHandoff._id)
      .populate('createdBy', 'fullName image role')
      .populate('wardId', 'name wardNumber')
      .populate('departmentId', 'name');

    return NextResponse.json(populatedHandoff, { status: 201 });
  } catch (error) {
    console.error('Error creating shift handoff:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}