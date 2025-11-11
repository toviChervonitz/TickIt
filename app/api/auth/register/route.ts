import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { registerSchema } from "@/app/lib/validation";
import { hashPassword } from "@/app/lib/bcrypt";
import { createToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    // Validate request body
    const { error } = registerSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "User already exists" },
        { status: 409 }
      );
    }

    // Enforce password for manual users
    if (body.provider === "credentials" && !body.password) {
      return NextResponse.json(
        { status: "error", message: "Password is required for manual registration" },
        { status: 400 }
      );
    }

    // Hash password only if it exists
    const hashedPassword = body.password ? await hashPassword(body.password) : undefined;

    // Create new user
    const newUser = await User.create({
      ...body,
      password: hashedPassword,
    });

    // Generate JWT
    const token = createToken({ id: newUser._id, email: newUser.email });

    // Return safe user object (no password)
    const userObj = newUser.toObject();
    delete userObj.password;

    const response = NextResponse.json(
      {
        status: "success",
        message: "Registration successful",
        user: userObj,
        token,
      },
      { status: 201 }
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
    console.error("Register Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
