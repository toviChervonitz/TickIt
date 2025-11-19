import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { createToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { name, email, image } = body;

    if (!name || !email) {
      return NextResponse.json(
        { status: "error", message: "Name and email are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    
    // If user exists, treat as login
    if (existingUser) {
      const token = createToken({ id: existingUser._id!.toString(), email: existingUser.email });
      const userObj = existingUser.toObject();
      delete userObj.password;

      const response = NextResponse.json(
        { status: "success", message: "Login successful", user: userObj, token },
        { status: 200 }
      );

      // Set cookie
      response.cookies.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    }

    // Create new user for first-time Google sign-in
    const user = await User.create({
      name,
      email,
      image: image || "",
      provider: "google",
      password: "",
    });

    const token = createToken({ id: user._id!.toString(), email: user.email });
    const userObj = user.toObject();
    delete userObj.password;

    const response = NextResponse.json(
      { status: "success", message: "Registration successful", user: userObj, token },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google Register Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
