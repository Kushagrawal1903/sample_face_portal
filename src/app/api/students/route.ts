import { NextRequest, NextResponse } from "next/server";
import { getAllStudentFaces, deleteStudentFace } from "@/lib/db";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get("passcode");

    // Check admin passcode
    if (!passcode || passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Invalid admin passcode." },
        { status: 401 }
      );
    }

    const students = await getAllStudentFaces();

    return NextResponse.json({
      success: true,
      total_count: students.length,
      students,
    });
  } catch (error: any) {
    console.error("[API /api/students GET Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch student records." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get("passcode");
    const computer_code = searchParams.get("computer_code");

    if (!passcode || passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (!computer_code) {
      return NextResponse.json(
        { success: false, message: "Missing computer_code parameter." },
        { status: 400 }
      );
    }

    await deleteStudentFace(computer_code);

    return NextResponse.json({
      success: true,
      message: `Deleted record for ${computer_code}`,
    });
  } catch (error: any) {
    console.error("[API /api/students DELETE Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete student record." },
      { status: 500 }
    );
  }
}
