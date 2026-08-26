import { NextRequest, NextResponse } from "next/server";
import { getAssistantReply } from "@/lib/assistant";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, message: "No message provided." }, { status: 400 });
    }

    const reply = await getAssistantReply(message);
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("[POST /api/assistant]", error);
    return NextResponse.json({ success: false, message: "Assistant error." }, { status: 500 });
  }
}
