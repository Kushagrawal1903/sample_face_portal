import { NextRequest, NextResponse } from "next/server";
import { saveStudentFace, MultiPoseImages } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, computer_code, enrollment_no, image_data, sample_images } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!computer_code || typeof computer_code !== "string" || computer_code.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Please enter your Computer Code." },
        { status: 400 }
      );
    }

    if (!enrollment_no || typeof enrollment_no !== "string" || enrollment_no.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Please enter your Enrollment Number." },
        { status: 400 }
      );
    }

    // Determine poses
    let poses: MultiPoseImages | undefined = sample_images;
    if (!poses && image_data) {
      poses = {
        front: image_data,
        left: image_data,
        right: image_data,
        tilt: image_data,
      };
    }

    if (!poses || !poses.front) {
      return NextResponse.json(
        { success: false, message: "Missing 4-angle face scan photos. Please complete all 4 poses." },
        { status: 400 }
      );
    }

    // Extract client IP and User Agent for audit logging
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const result = await saveStudentFace({
      name,
      computer_code,
      enrollment_no,
      image_data: poses.front,
      sample_images: poses,
      ip_address: ip.split(",")[0].trim(),
      user_agent: userAgent,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "4-Angle biometric face scans registered successfully!",
        data: {
          id: result.id,
          name: name.trim(),
          computer_code: computer_code.trim().toUpperCase(),
          enrollment_no: enrollment_no.trim().toUpperCase(),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message || "Failed to save face data." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[API /api/enroll Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
