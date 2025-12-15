import { dbConnect } from "@/app/lib/DB";
import {  getAuthenticatedUser } from "@/app/lib/jwt";
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

    const userId = currentUser.id;

    const projectUser = await ProjectUser.findOne({ userId, projectId });

    if (!projectUser) {
      return NextResponse.json(
        { status: "success", message: "Project not found", isArchived: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "project fetched successfully",
        isArchived: projectUser.isArchived,
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
