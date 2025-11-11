import { dbConnect } from "@/app/lib/DB";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "userId is required" },
        { status: 400 }
      );
    }
    const res = await await ProjectUser.findOne({ userId, projectId });
    if (!res) {
      return NextResponse.json(
        { status: "success", message: "No role found", role: null },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        status: "success",
        message: "role fetched successfully",
        role: res.role,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
