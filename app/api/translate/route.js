export const runtime = "nodejs";



import { translate } from "@vitalets/google-translate-api";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ translated: "" });
    }

    const res = await translate(text, {
      from: "en",
      to: "sk",
    });

    return NextResponse.json({
      translated: res.text,
    });
  } catch (err) {
    console.error("TRANSLATE ERROR:", err);
    return NextResponse.json({
      translated: "",
      error: err.message,
    });
  }
}
