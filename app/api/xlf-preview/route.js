export const runtime = "nodejs";

import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const xmlText = await file.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const xmlObj = parser.parse(xmlText);

    const units =
      xmlObj?.xliff?.file?.body?.["trans-unit"] || [];

    const transUnits = Array.isArray(units) ? units : [units];

    const result = [];

    for (const unit of transUnits) {
      if (!unit.source) continue;

      const res = await axios.post(
        "https://api-free.deepl.com/v2/translate",
        {
          text: [unit.source],
          source_lang: "EN",
          target_lang: "SK",
        },
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      result.push({
        id: unit.id,
        source: unit.source,
        target: res.data.translations[0].text,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return NextResponse.json({ error: "Preview failed" }, { status: 500 });
  }
}
