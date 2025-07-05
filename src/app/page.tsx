"use client";

import { useState } from "react";

export default function Home() {
  const [disability, setDisability] = useState("dyslexia");
  const [material, setMaterial] = useState<File | null>(null);
  const [testQuestions, setTestQuestions] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const getAnswers = async () => {
    if (!material || !testQuestions || !disability) {
      alert("Please provide all required inputs.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("material", material);
      formData.append("questions", await testQuestions.text());
      formData.append("disability", disability);

      const res = await fetch("http://localhost:3000/api/material", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      setResponse(data.output);
    } catch (error) {
      console.error(error);
      setResponse("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-y-4">
          <div>
            <p className="text-lg font-semibold">
              Upload your educational material (PDF only)
            </p>
            <input
              type="file"
              accept="application/pdf"
              className="rounded py-1 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-blue-50 hover:file:bg-blue-600 file:cursor-pointer"
              onChange={(e) => setMaterial(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <p className="text-lg font-semibold">
              Upload test questions (JSON only)
            </p>
            <input
              type="file"
              accept="application/JSON"
              className="rounded py-1 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-blue-50 hover:file:bg-blue-600 file:cursor-pointer"
              onChange={(e) => setTestQuestions(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <p className="text-lg font-semibold">
              Select a learning disability
            </p>
            <select
              value={disability}
              onChange={(e) => setDisability(e.target.value)}
              className="p-2 rounded border"
            >
              <option value="dyslexia">Dyslexia</option>
              <option value="adhd">ADHD</option>
              <option value="autism">Autism</option>
            </select>
          </div>

          <button
            onClick={getAnswers}
            disabled={loading}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 cursor-pointer"
          >
            {loading ? "Submitting..." : "Get answers"}
          </button>
        </div>

        {response && (
          <div className="mt-6 p-4 border rounded  whitespace-pre-wrap">
            <h2 className="text-lg font-semibold mb-2">Student Response:</h2>
            {response}
          </div>
        )}
      </main>
    </div>
  );
}
