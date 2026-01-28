import { XMLParser } from "fast-xml-parser";
import { NextResponse } from "next/server";

export async function POST(req) {
  const xml = await req.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const json = parser.parse(xml);

  
  
  const text = JSON.stringify(json);

  return NextResponse.json({ text });
}
