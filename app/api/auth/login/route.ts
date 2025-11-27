import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";
import { loginSchema } from "@/app/lib/validation";
import { comparePassword } from "@/app/lib/bcrypt";
import { createAuthResponse } from "@/app/lib/jwt";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { error } = loginSchema.validate(body);
        if (error) {
            return NextResponse.json(
                { status: "error", message: error.message },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: body.email });
        if (!user) {
            return NextResponse.json(
                { status: "error", message: "User not found" },
                { status: 404 }
            );
        }

        const valid = await comparePassword(body.password, user.password!);
        if (!valid) {
            return NextResponse.json(
                { status: "error", message: "Invalid password" },
                { status: 401 }
            );
        }

        const userObj = user.toObject();
        delete userObj.password;

        return createAuthResponse(userObj, "Login successful");


    } catch (err: any) {
        console.error("Login Error:", err);
        return NextResponse.json(
            { status: "error", message: "Server error" },
            { status: 500 }
        );
    }
}
