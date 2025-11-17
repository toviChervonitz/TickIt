import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { createToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const token = createToken({ id: user._id, email: user.email });
    const userObj = user.toObject();
    delete userObj.password;

    const response = NextResponse.json(
      {
        status: "success",
        message: "Login successful",
        user: userObj,
        token,
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google Login Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
