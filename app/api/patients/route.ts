import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole, ROLE } from "@/lib/rbac";
import Patient, { IPatient } from "@/models/Patient";
import { Patient as PatientInterface } from "@/types/patient";
import connectToDB from "@/lib/dbConnect";
import { Document } from 'mongoose';
 
 export async function GET(req: NextRequest) { 
   const { searchParams  } = new URL(req.url ); 
   const q = searchParams.get("q" ); 
 
   if (!q) { 
     return NextResponse.json( 
       { message: "Query parameter q is required"  }, 
       { status: 400  } 
     ); 
   } 
 
   try { 
     const session = await getServerSession(authOptions);
     if (!session || !session.user || !session.user.organizationId) {
       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
     }

     await connectToDB(); 
 
     const patients = await Patient.find({
      orgId: session.user.organizationId,
      $or: [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { mrn: { $regex: q, $options: "i" } },
      ],
    }).limit(10); 
 
     return NextResponse.json(patients ); 
   } catch (error) { 
     console.error("Failed to fetch patients: ", error ); 
     return NextResponse.json( 
       { message: "Failed to fetch patients"  }, 
       { status: 500  } 
     ); 
   } 
 } 
 
 export async function POST(req: NextRequest) { 
   if (!(await requireRole(req, [ROLE.ADMIN, ROLE.RECEPTIONIST ]))) { 
     return NextResponse.json({ message: "Unauthorized"  }, { status: 401  }); 
   } 
 
   try { 
     const body: PatientInterface = await req.json();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organizationId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const orgId = session.user.organizationId;

    // Find the highest MRN for the organization
    const lastPatient = await Patient.findOne({ orgId }).sort({ mrn: -1 });

    let newMrn;
    if (lastPatient && lastPatient.mrn) {
      const lastMrnNumber = parseInt(lastPatient.mrn.split("-")[1], 10);
      newMrn = `MRN-${lastMrnNumber + 1}`;
    } else {
      newMrn = "MRN-1";
    }

    const newPatient = new Patient({
      ...body,
      orgId,
      mrn: newMrn,
    });

    newPatient._setAuditContext(session.user.id, session.user.role, null, { ip: req.headers.get("x-forwarded-for") });
    await newPatient.save();
 
     return NextResponse.json(newPatient, { status: 201  }); 
   } catch (error) { 
     console.error("Failed to create patient: ", error ); 
     return NextResponse.json( 
       { message: "Failed to create patient"  }, 
       { status: 500  } 
     ); 
   } 
 }