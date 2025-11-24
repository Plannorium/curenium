import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { hasCapability } from "@/lib/auth";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import AuditLog from "@/models/AuditLog";
import { pusher } from "@/lib/pusher";
import {NextResponse as Response} from "next/server";

const bookingSchema = z.object({
  patientId: z.string(),
  providerId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, Response.next(), sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasCapability(session.user.role, "create:booking")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const validation = bookingSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.formErrors },
      { status: 400 }
    );
  }

  await dbConnect();

  // In a real application, you would check for provider availability
  // before creating the booking.

  const booking = new Booking({
    ...validation.data,
    createdBy: session.user.id,
  });

  await booking.save();

  await AuditLog.create({
    user: session.user.id,
    model: "Booking",
    modelId: booking._id,
    action: "create",
    data: booking.toJSON(),
  });

  await pusher.trigger("bookings", "booking:created", booking);

  return NextResponse.json({ ok: true, booking });
}