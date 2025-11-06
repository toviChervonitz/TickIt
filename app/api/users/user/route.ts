// /app/api/user/getId/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select("_id");

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", userId: user._id },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Get User ID Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
