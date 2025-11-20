import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { registerSchema } from "@/app/lib/validation";
import { hashPassword } from "@/app/lib/bcrypt";
import { createAuthResponse, createToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { error } = registerSchema.validate(body);

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { status: "error", message: "User already exists" },
        { status: 409 }
      );
    }

    if (body.provider === "credentials" && !body.password) {
      return NextResponse.json(
        { status: "error", message: "Password is required for manual registration" },
        { status: 400 }
      );
    }

    const hashedPassword = body.password ? await hashPassword(body.password) : undefined;

    const newUser = await User.create({
      ...body,
      password: hashedPassword,
    });


    const userObj = newUser.toObject();
    delete userObj.password;

    return createAuthResponse(userObj, "Login successful");

  } catch (err: any) {
    console.error("Register Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
