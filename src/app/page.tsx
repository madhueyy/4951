"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaRegFilePdf,
} from "react-icons/fa6";
import { BiCheck, BiPlus } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";

export default function Home() {
  const [disability, setDisability] = useState("");
  const [material, setMaterial] = useState<File | null>(null);
  const [testQuestions, setTestQuestions] = useState<string[]>([""]);
  const [pdfId, setPdfId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const resetSimulation = () => {
    setMaterial(null);
    setTestQuestions([""]);
    setDisability("");
    setPdfId("");
    setResponse([]);
    setLoading(false);
    setStep(1);
  };

  const getAnswers = async () => {
    if (!material || !testQuestions || !disability) {
      alert("Please provide all required inputs.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("material", material);
      formData.append("questions", JSON.stringify(testQuestions));
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

      const fullText = data.output.text;
      const jsonMatch = fullText.match(/\[\s*".*?"\s*(?:,\s*".*?"\s*)*\]/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setResponse(parsed);
      } else {
        setResponse([fullText]);
      }
    } catch (error) {
      console.error(error);
      setResponse(["Failed to fetch response."]);
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

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...testQuestions];
    newQuestions[index] = value;
    setTestQuestions(newQuestions);
  };

  const removeQuestionField = (index: number) => {
    const newQuestions = testQuestions.filter((_, i) => i !== index);
    setTestQuestions(newQuestions.length > 0 ? newQuestions : [""]);
  };

  const addQuestionField = () => {
    setTestQuestions([...testQuestions, ""]);
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber === 3) {
      const hasValidQuestions = testQuestions.some((q) => q.trim() !== "");
      if (hasValidQuestions) {
        setStep(stepNumber);
      }
    } else {
      setStep(stepNumber);
    }
  };

  const handleDisabilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDisability(value);
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
    <div className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] bg-zinc-800">
      {response.length <= 0 ? (
        <main className="flex flex-col gap-y-6 w-full h-full py-12 justify-center items-center">
          <p className="text-3xl font-semibold">Welcome to Diverse Claire!</p>

          <div className="flex flex-col gap-y-4 min-w-[70%] md:min-w-[60%] justify-center self-center bg-zinc-700 px-6 py-6 rounded-lg">
            <p className="text-xl font-semibold">Get Started</p>
            <StepIndicator
              stepNumber={1}
              label="Upload your educational materials"
            />
            <StepIndicator stepNumber={2} label="Create test questions" />
            <StepIndicator stepNumber={3} label="Select student persona" />
            <StepIndicator
              stepNumber={4}
              label="Run simulation & get feedback"
            />

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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
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
              <div className="flex flex-col items-center w-full mt-4 gap-y-4">
                {testQuestions?.map((question, index) => (
                  <div key={index} className="flex items-center w-full gap-2">
                    <textarea
                      placeholder={`Question ${index + 1}`}
                      value={question}
                      rows={3}
                      className="w-full border text-sm rounded px-3 py-2 bg-zinc-800 text-white border-zinc-600 focus:border-blue-500 focus:ring-blue-500"
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                    />

                    {testQuestions.length > 1 && (
                      <button
                        className="text-gray-400 hover:text-red-400 hover:bg-white p-1 rounded cursor-pointer transition-colors"
                        onClick={() => removeQuestionField(index)}
                      >
                        <RxCross2 />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  className="flex flex-row w-full py-3 text-md font-semibold rounded items-center justify-center border bg-zinc-600 border-zinc-500 hover:bg-zinc-500 cursor-pointer"
                  onClick={addQuestionField}
                >
                  <BiPlus className="mr-2 h-4 w-4" /> Add Question
                </button>

                <div className="flex w-full gap-4">
                  <button
                    onClick={() => goToStep(1)}
                    className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-zinc-600 rounded hover:bg-zinc-500 cursor-pointer text-white"
                  >
                    <FaArrowLeftLong className="text-sm" />
                    Back
                  </button>
                  <button
                    className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                    disabled={testQuestions.some((question) => question === "")}
                    onClick={() => goToStep(3)}
                  >
                    Continue
                    <FaArrowRightLong className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* For choosing student persona */}
            {step === 3 && (
              <div className="mt-4">
                <div className="relative w-full">
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

                <div className="flex w-full gap-4 mt-4">
                  <button
                    onClick={() => goToStep(2)}
                    className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-zinc-600 rounded hover:bg-zinc-500 cursor-pointer text-white"
                  >
                    <FaArrowLeftLong className="text-sm" />
                    Back
                  </button>
                  <button
                    onClick={() => goToStep(4)}
                    className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                    disabled={!disability}
                  >
                    Continue
                    <FaArrowRightLong className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* Run simulation button */}
            {step === 4 && (
              <div className="flex w-full gap-4 mt-4">
                <button
                  onClick={() => goToStep(3)}
                  className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-zinc-600 rounded hover:bg-zinc-500 cursor-pointer text-white"
                >
                  <FaArrowLeftLong className="text-sm" />
                  Back
                </button>
                <button
                  onClick={getAnswers}
                  disabled={loading}
                  className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                >
                  {loading ? "Running..." : "Run Simulation"}
                  <FaArrowRightLong className="text-sm" />
                </button>
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="flex flex-col justify-center items-center pt-12 px-4">
          <h2 className="text-2xl font-semibold">
            Simulated Student's Responses
          </h2>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
            <div className="p-4 flex-grow overflow-y-auto my-6 border bg-zinc-700 border-zinc-600 rounded-lg whitespace-pre-wrap text-white">
              {response.map((answer, index) => (
                <div
                  key={index}
                  className="border bg-zinc-600 border-zinc-500 px-3 py-2 my-4 rounded-lg"
                >
                  <p className="flex flex-row gap-x-2 mb-2 text-md font-semibold">
                    <span className="text-blue-400">Question {index + 1}:</span>
                    <span>
                      {testQuestions[index] || "Question text not available"}
                    </span>
                  </p>

                  <p>
                    <span className="text-md text-orange-400 font-semibold">
                      Student's Answer:{" "}
                    </span>
                    <span className="text-sm">{answer}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 my-6 border bg-zinc-700 border-zinc-600 rounded-lg text-white flex flex-col items-center text-center">
              <img
                src="/default-profile.png"
                alt="Claire's Profile Picture"
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
              />

              <p className="text-xl font-semibold mb-2">Claire's Profile</p>
              <div className="text-left w-full">
                <p className="mb-1">
                  <span className="font-semibold text-gray-300">Age: </span>18
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-gray-300">Degree: </span>
                  Computer Science
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-gray-300">Stage: </span>
                  First Year
                </p>
                <p>
                  <span className="font-semibold text-gray-300">
                    Learning Disability:
                  </span>{" "}
                  {disability.toLocaleUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 mb-6 w-full max-w-4xl rounded-lg border bg-zinc-700 border-zinc-600 text-white">
            <p className="text-xl font-semibold mb-2">
              Your Uploaded Educational Material
            </p>
            {material ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-600 rounded-md">
                <FaRegFilePdf className="w-6 h-6 text-blue-400" />
                <span className="text-md font-medium">{material.name}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No material uploaded yet.</p>
            )}
          </div>

          <button
            className="flex flex-row text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 cursor-pointer text-white"
            onClick={resetSimulation}
          >
            <FaArrowLeftLong className="text-sm" />
            Upload New Material
          </button>
        </main>
      )}
    </div>
  );
}
