"use client";

import { useState } from "react";

export default function Home() {
  const [original, setOriginal] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text"); // "text" = ručný, "xml" = súbory

  
  
  async function handleFiles(files) {
    setMode("xml");
    let combined = "";

    for (const file of Array.from(files)) {
      const xml = await file.text();

      const res = await fetch("/api/parse-xml", {
        method: "POST",
        body: xml,
      });

      const data = await res.json();

      combined += `\n\n--- FILE: ${file.name} ---\n\n${data.text}`;
    }

    setOriginal(combined);
    setTranslated("");
  }

async function translate() {
  if (!original.trim()) return;

  setLoading(true);
  setTranslated("");

  try {
    const chunks = original.match(/[\s\S]{1,4000}/g) || [];
    let result = "";

    for (const chunk of chunks) {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunk }),
      });

      const data = await res.json();
      result += data.translated;
    }

    setTranslated(result);
  } catch (err) {
    console.error(err);
    alert("Chyba pri preklade: " + err.message);
  } finally {
    setLoading(false);
  }
}


  async function exportZip() {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    zip.file(
      mode === "xml" ? "translations.txt" : "translation.txt",
      translated
    );

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "translations.zip";
    a.click();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">


        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">AI Translator</h1>
          <p className="text-gray-500 mt-2">
            EN → SK • Free • XML / Text
          </p>
        </header>

       
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow">
          <input
            type="file"
            accept=".xml"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="block w-full md:w-auto p-2 border rounded-lg"
          />

          <span className="text-gray-400 text-sm">alebo</span>

          <button
            onClick={() => {
              setMode("text");
              setOriginal("");
              setTranslated("");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Písať text ručne
          </button>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <p className="mb-2 text-sm text-gray-500">
              {mode === "text" ? "Režim: ručný text" : "Režim: XML upload"}
            </p>
            <label className="block font-semibold mb-2 text-gray-700">
              Original (EN)
            </label>
            <textarea
              value={original}
              onChange={(e) => {
                setMode("text");
                setOriginal(e.target.value);
              }}
              placeholder="Sem napíš text alebo nahraj XML..."
              className="w-full h-80 p-4 border rounded-xl focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Preklad (SK)
            </label>
            <textarea
              value={translated}
              readOnly
              placeholder="Tu sa zobrazí preklad..."
              className="w-full h-80 p-4 border rounded-xl bg-gray-50 focus:outline-none"
            />
          </div>

        </div>
 
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={translate}
            disabled={loading || !original.trim()}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Prekladám..." : "Preložiť"}
          </button>

          <button
            onClick={exportZip}
            disabled={!translated}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-black disabled:opacity-50"
          >
            Export ZIP
          </button>
        </div>
                <p className="text-center">Julius Varadi 2026</p>
      </div>
    </main>
  );
}
