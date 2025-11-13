import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import User from "@/app/models/UserModel";

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) return NextResponse.json({ exists: false });

  const user = await User.findOne({ email });
  return NextResponse.json({ exists: !!user });
}
