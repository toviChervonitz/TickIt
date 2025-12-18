import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ResetCode from "@/app/models/ResetCodeModel";
import { sendResetCodeEmail } from "@/app/lib/mailer";
import { dbConnect } from "@/app/lib/DB";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ResetCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true }
    );

    await sendResetCodeEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending reset code:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
