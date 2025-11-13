import { dbConnect } from "@/app/lib/DB";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";
import { use } from "react";

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

    const authHeader = req.headers.get("authorization");
    // const compareTokenResult = compareToken(userId, authHeader!);
    // console.log("compareTokenResult " + compareTokenResult);
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") 
    //   ||      !compareTokenResult
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
