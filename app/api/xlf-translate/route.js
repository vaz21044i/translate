export const runtime = "nodejs";

import axios from "axios";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const xmlText = await file.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      format: true,
      suppressEmptyNode: true,
    });

    const xmlObj = parser.parse(xmlText);

    const units =
      xmlObj?.xliff?.file?.body?.["trans-unit"] || [];

    const transUnits = Array.isArray(units) ? units : [units];

    // preložiť každý source → target
    for (const unit of transUnits) {
      if (!unit.source) continue;
      if (unit.target && unit.target.trim() !== "") continue;

      const res = await axios.post(
        "https://api-free.deepl.com/v2/translate",
        {
          text: [unit.source],
          source_lang: "EN",
          target_lang: "SK",
          preserve_formatting: true,
        },
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      unit.target = res.data.translations[0].text;
    }

    const outputXml = builder.build(xmlObj);

    return new Response(outputXml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": "attachment; filename=translated_sk.xlf",
      },
    });
  } catch (err) {
    console.error("XLF TRANSLATE ERROR:", err?.response?.data || err.message);
    return NextResponse.json({ error: "XLF translation failed" }, { status: 500 });
  }
}
