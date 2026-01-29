"use client";

import { useState } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function previewUpload(f) {
    setFile(f);
    setLoading(true);

    const fd = new FormData();
    fd.append("file", f);

    const res = await fetch("/api/xlf-preview", { method: "POST", body: fd });
    const data = await res.json();
    setRows(data);
    setLoading(false);
  }

  async function downloadTranslated() {
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/xlf-translate", { method: "POST", body: fd });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "translated_sk.xlf";
    a.click();

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-2xl font-bold mb-6">Apex XLF ENG do SK</h1>
    <div className="input-cover border-2">

      <input
        type="file"
        accept=".xlf"
        className="mb-6"
        onChange={(e) => previewUpload(e.target.files[0])}
      />

      {loading && <p>Spracovávam…</p>}
    </div>

      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded shadow mb-4">
            <div className="font-semibold">EN</div>
            <div className="font-semibold">SK</div>

            {rows.map((row) => (
              <>
                <div key={row.id + "-en"} className="border p-2 whitespace-pre-wrap">
                  {row.source}
                </div>
                <div key={row.id + "-sk"} className="border p-2 whitespace-pre-wrap">
                  {row.target}
                </div>
              </>
            ))}
          </div>

          <button
            onClick={downloadTranslated}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Stiahnut Slovenske XLF
          </button>
        </>
      )}
    </div>
  );
}
