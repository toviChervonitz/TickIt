import { NextResponse } from "next/server";
import ResetCode from "@/app/models/ResetCodeModel";
import { dbConnect } from "@/app/lib/DB";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, code } = await req.json();
    const data = await ResetCode.findOne({ email });

    if (!data) return NextResponse.json({ error: "No reset request" }, { status: 400 });
    if (data.code !== code) return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    if (Date.now() > data.expiresAt)
      return NextResponse.json({ error: "Code expired" }, { status: 400 });

    return NextResponse.json({ success: true });
  }
  catch (err) {
    console.error("Error sending reset code:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
