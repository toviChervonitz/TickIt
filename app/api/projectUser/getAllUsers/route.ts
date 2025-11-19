import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json(
        { status: "error", message: "projectId is required" },
        { status: 400 }
      );
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mamageship = await ProjectUser.findOne({
      projectId,
      userId: currentUser.id,
      role: "manager",
    });

    if (!mamageship) {
      return NextResponse.json(
        { error: "Forbidden - Only managers can view this list" },
        { status: 403 }
      );
    }

    const res = await ProjectUser.find({ projectId }).
      populate("userId", "name email");
    if (!res) {
      return NextResponse.json(
        { status: "success", message: "No users found", users: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "users fetched successfully",
        users: res.map((pu) => pu.userId),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Get All Users Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
