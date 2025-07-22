"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import { BiCheck } from "react-icons/bi";

export default function Home() {
  const [disability, setDisability] = useState("");
  const [material, setMaterial] = useState<File | null>(null);
  const [testQuestions, setTestQuestions] = useState<File | null>(null);
  const [pdfId, setPdfId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [step, setStep] = useState(1);

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
      formData.append("pdfId", pdfId);

      const res = await fetch("http://localhost:3000/api/material", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      setResponse(data.output.text);
    } catch (error) {
      console.error(error);
      setResponse("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMaterial(file);

    if (file) {
      setStep(2);
    }
  };

  const handleTestQuestionsUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setTestQuestions(file);

    if (file) {
      setStep(3);
    }
  };

  const handleDisabilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDisability(value);

    if (value) {
      setStep(4);
    }
  };

  const StepIndicator = ({
    stepNumber,
    label,
  }: {
    stepNumber: number;
    label: string;
  }) => {
    const isActive = step === stepNumber;
    const isCompleted = step > stepNumber;

    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          isActive
            ? "bg-zinc-600 border-blue-500"
            : "bg-zinc-500 border-zinc-600"
        }`}
      >
        <div
          className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold ${
            isCompleted
              ? "bg-green-500"
              : isActive
              ? "bg-blue-500"
              : "bg-slate-400"
          }`}
        >
          {isCompleted ? <BiCheck className="w-4 h-4" /> : stepNumber}
        </div>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
    );
  };

  return (
    <div className="w-[100vw] h-[100vh] font-[family-name:var(--font-geist-sans)] bg-zinc-800">
      <main className="flex flex-col gap-y-4 w-full h-full justify-center items-center">
        <p className="text-3xl font-semibold">Welcome to Diverse Claire!</p>

        <div className="flex flex-col gap-y-4 w-[60%] justify-center self-center bg-zinc-700 px-6 py-6 rounded-lg">
          <p className="text-xl font-semibold">Get Started</p>
          <StepIndicator
            stepNumber={1}
            label="Upload your educational materials"
          />
          <StepIndicator stepNumber={2} label="Create test questions" />
          <StepIndicator stepNumber={3} label="Select student persona" />
          <StepIndicator stepNumber={4} label="Run simulation & get feedback" />

          {/* For uploading educational materials */}
          {step === 1 && (
            <div className="flex items-center justify-center w-full mt-4">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 bg-gray-700 border-gray-600 hover:border-gray-500">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>

                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  (PDF only)
                </p>

                {material && (
                  <p className="text-sm text-gray-400 mt-2">
                    File selected: {material.name}
                  </p>
                )}

                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleMaterialUpload}
                />
              </label>
            </div>
          )}

          {/* For uploading test questions */}
          {step === 2 && (
            <div className="flex flex-col items-center w-full mt-4">
              <label className="sr-only">Upload test questions</label>
              <input
                type="file"
                accept="application/json"
                className="rounded py-1 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-blue-50 hover:file:bg-blue-600 file:cursor-pointer w-full"
                onChange={handleTestQuestionsUpload}
              />
              {testQuestions && (
                <p className="text-sm text-gray-400 mt-2">
                  File selected: {testQuestions.name}
                </p>
              )}
            </div>
          )}

          {/* For choosing student persona */}
          {step === 3 && (
            <div className="relative w-full mt-4">
              <label className="sr-only">Choose a diverse profile</label>
              <select
                value={disability}
                className="py-2 px-3 rounded-lg border w-full appearance-none bg-zinc-800 text-white border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleDisabilitySelect}
              >
                <option value="" disabled>
                  Choose a diverse profile
                </option>
                <option value="dyslexia">Dyslexia</option>
                <option value="adhd">ADHD</option>
                <option value="autism">Autism</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IoIosArrowDown className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Run simulation button */}
          {step === 4 && (
            <button
              onClick={getAnswers}
              disabled={loading}
              className="flex flex-row mt-4 text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 cursor-pointer text-white"
            >
              {loading ? "Submitting..." : "Continue"}
              <FaArrowRightLong className="text-sm" />
            </button>
          )}
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
