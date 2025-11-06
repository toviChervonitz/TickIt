// /app/api/projectUser/verifyProjectUser/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import ProjectUser from "@/app/models/ProjectUserModel"; // model linking user <-> project

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { userId, projectId, role } = body;

    if (!userId || !projectId || !role) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields." },
        { status: 400 }
      );
    }

    const projectUser = await ProjectUser.findOne({ userId, projectId, role });

    if (!projectUser) {
      return NextResponse.json(
        { status: "error", message: "User is not authorized for this project." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { status: "success", message: "User authorized." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Verify Project User Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
