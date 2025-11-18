import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

console.log(session,"session");
console.log("here1 calender");

if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

const calendar = google.calendar({
    version: "v3",
    auth: session.accessToken
});

console.log("here 2 calender");
const res = await calendar.events.list({
    calendarId: "primary",
    maxResults: 20,
    singleEvents: true,
    orderBy: "startTime"
});


  return NextResponse.json(res.data.items);
}
