"use client";

import { useState } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { LuFiles } from "react-icons/lu";
import { BiCheck, BiPlus } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { getAnswers } from "../utils/simulation";
import LoadingCircle from "../components/LoadingCircle";

export default function NewSimulation() {
  const [disability, setDisability] = useState("");
  const [material, setMaterial] = useState<File[]>([]);
  const [testQuestions, setTestQuestions] = useState<string[]>([""]);
  const [testAnswers, setTestAnswers] = useState<string[]>([""]);
  const [pdfId, setPdfId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedTestQuestions, setGeneratedTestQuestions] = useState<
    { type: string; question: string }[]
  >([]);
  const [generatedTestAnswers, setGeneratedTestAnswers] = useState<
    { type: string; answer: string }[]
  >([]);

  const router = useRouter();

  // Function to get test questions and answers
  const getTestQuestions = async () => {
    if (!material.length) {
      alert("Please upload educational materials first.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      material.forEach((file) => {
        formData.append("material", file);
      });

      const res = await fetch("http://localhost:3000/api/question_generation", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const text = data.output.text;
      const cleanText = text.replace(/```json\s*|```/g, "").trim();

      if (typeof data === "object") {
        // const jsonMatch = data.output.text.match(/\{[\s\S]*\}/);
        // console.log(jsonMatch);
        const parsedData = JSON.parse(cleanText);
        console.log(parsedData);

        const questions = Object.entries(parsedData)
          .filter(([key]) => !key.includes("Answer"))
          .map(([key, value]) => ({
            type: key,
            question: value as string,
          }));

        const testAnswers = Object.entries(parsedData)
          .filter(([key]) => key.includes("Answer"))
          .map(([key, value]) => ({
            type: key.replace(" Answer", ""),
            answer: value as string,
          }));

        setGeneratedTestQuestions(questions);
        setGeneratedTestAnswers(testAnswers);
        console.log("Parsed questions:", questions);
        console.log("Parsed answers:", testAnswers);
      } else {
        console.error("Unexpected response format:", data);
        return;
      }

      setStep(2);
    } catch (error) {
      console.error("Error fetching test questions:", error);
      alert("Failed to fetch test questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...testQuestions];
    newQuestions[index] = value;
    setTestQuestions(newQuestions);

    const newAnswers = [...testAnswers];
    newAnswers[index] = value;
    setTestAnswers(newAnswers);
  };

  const removeQuestionField = (index: number) => {
    const newQuestions = testQuestions.filter((_, i) => i !== index);
    const newAnswers = testAnswers.filter((_, i) => i !== index);
    setTestQuestions(newQuestions.length > 0 ? newQuestions : [""]);
    setTestAnswers(newAnswers.length > 0 ? newAnswers : [""]);
  };

  const addQuestionField = () => {
    setTestQuestions([...testQuestions, ""]);
  };

  const addSuggestedQuestion = (question: string, type: string) => {
    const answerObj = generatedTestAnswers.find((ans) => ans.type === type);
    const answer = answerObj ? answerObj.answer : "";

    // Check if the question is already in the list
    if (testQuestions.includes(question)) {
      return;
    }

    // If there's an empty question field then replace it,
    // else add it as a new question
    const emptyIndex = testQuestions.findIndex((q) => q.trim() === "");
    if (emptyIndex !== -1) {
      const newQuestions = [...testQuestions];
      const newAnswers = [...testAnswers];
      newQuestions[emptyIndex] = question;
      newAnswers[emptyIndex] = answer;
      setTestQuestions(newQuestions);
      setTestAnswers(newAnswers);
    } else {
      setTestQuestions([...testQuestions, question]);
      setTestAnswers([...testAnswers, answer]);
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber === 2) {
      getTestQuestions();
    } else if (stepNumber === 3) {
      const hasValidQuestions = testQuestions.some((q) => q.trim() !== "");
      if (hasValidQuestions) {
        setStep(stepNumber);
      }
    } else {
      setStep(stepNumber);
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
      <div className="flex flex-col items-center gap-3 p-3 rounded-lg">
        <div
          className={`w-10 h-10 text-white rounded-full flex items-center justify-center text-md font-bold ${
            isCompleted
              ? "bg-green-500"
              : isActive
              ? "bg-blue-500"
              : "bg-zinc-500"
          }`}
        >
          {isCompleted ? <BiCheck className="w-6 h-6" /> : stepNumber}
        </div>
        <span
          className={`text-sm text-center font-medium ${
            isCompleted
              ? "text-green-400"
              : isActive
              ? "text-blue-400"
              : "text-zinc-500"
          }`}
        >
          {label}
        </span>
      </div>
    );
  };

  const disabilityOptions = [
    {
      value: "dyslexia",
      title: "Student with Dyslexia",
      characteristics: [
        "May process written information more slowly",
        "Often benefits from visual aids and structured content",
        "Might prefer audio explanations alongside text",
        "Can excel in creative and analytical thinking",
      ],
    },
    {
      value: "adhd",
      title: "Student with ADHD",
      characteristics: [
        "May benefit from shorter, focused content sections",
        "Often responds well to interactive elements",
        "Might need clear structure and organization",
        "Can bring high energy and creative perspectives",
      ],
    },
    {
      value: "autism",
      title: "Student with Autism",
      characteristics: [
        "Often prefers clear, detailed instructions",
        "May benefit from predictable content structure",
        "Might need explicit context and examples",
        "Can demonstrate strong attention to detail",
      ],
    },
    {
      value: "dyscalculia",
      title: "Student with Dyscalculia",
      characteristics: [
        "Struggles with numbers and math concepts",
        "Has trouble with mental calculations",
        "Finds patterns and sequences difficult",
        "Benefits from visual or step-by-step support",
      ],
    },
  ];

  return (
    <div className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] bg-zinc-800">
      <main className="flex flex-row">
        <Navbar />

        <div className="flex flex-col gap-y-6 w-full h-full py-12 justify-center items-center">
          {step === 1 && (
            <div>
              <p className="text-3xl font-semibold">
                Welcome to Diverse Claire!
              </p>
              <p className="text-lg">
                Get started by uploading your educational material
              </p>
            </div>
          )}

          <div className="flex flex-col gap-y-4 w-[70%] md:w-[60%] justify-center self-center px-6 py-6 rounded-lg">
            <div className="flex flex-row mx-auto gap-x-8">
              <StepIndicator stepNumber={1} label="Upload materials" />
              <StepIndicator stepNumber={2} label="Create questions" />
              <StepIndicator stepNumber={3} label="Select persona" />
              <StepIndicator stepNumber={4} label="Run simulation" />
            </div>

            {/* For uploading educational materials */}
            {step === 1 && (
              <div className="flex flex-col items-center w-full mt-4 gap-y-4">
                <div className="flex items-center justify-center w-full">
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

                    {material.length > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        File(s) selected:{" "}
                        {material.map((file) => file.name).join(", ")}
                      </p>
                    )}

                    <input
                      type="file"
                      accept="application/pdf"
                      multiple={true}
                      className="hidden"
                      onChange={(e) =>
                        setMaterial(
                          e.target.files ? Array.from(e.target.files) : []
                        )
                      }
                    />
                  </label>
                </div>

                <button
                  className="flex flex-row ml-auto w-full text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                  disabled={!material || loading}
                  onClick={() => goToStep(2)}
                >
                  {loading ? "Loading" : "Continue"}
                  {loading ? (
                    <LoadingCircle />
                  ) : (
                    <FaArrowRightLong className="text-sm" />
                  )}
                </button>
              </div>
            )}

            {/* For uploading test questions */}
            {step === 2 && (
              <div className="flex flex-col justify-center items-center w-full mt-4 gap-y-4">
                {/* User question input */}
                <div className="w-full">
                  <p className="text-xl font-medium mb-3">
                    Enter test questions
                  </p>

                  {testQuestions?.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-center w-full gap-2 mb-2"
                    >
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
                </div>

                {/* Add new question button */}
                <button
                  className="flex flex-row w-full py-3 text-md font-semibold rounded items-center justify-center border bg-zinc-600 border-zinc-500 hover:bg-zinc-500 cursor-pointer text-white"
                  onClick={addQuestionField}
                >
                  <BiPlus className="mr-2 h-4 w-4" /> Add new question
                </button>

                <div className="flex flex-row w-full items-center gap-x-2 my-4">
                  <hr className="text-zinc-500 w-full"></hr>
                  <p className="text-sm text-zinc-400">or</p>
                  <hr className="text-zinc-500 w-full"></hr>
                </div>

                {/* Suggested questions */}
                {generatedTestQuestions.length > 0 && (
                  <div className="w-full">
                    <p className="text-md font-medium mb-3">
                      Select any suggested questions
                    </p>

                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {generatedTestQuestions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            addSuggestedQuestion(item.question, item.type)
                          }
                          className={
                            testQuestions.includes(item.question)
                              ? `text-left p-3 bg-green-600 hover:bg-green-500 border border-green-500 rounded-lg text-sm cursor-pointer`
                              : `text-left p-3 bg-zinc-600 hover:bg-zinc-500 border border-zinc-500 rounded-lg text-sm cursor-pointer`
                          }
                          disabled={testQuestions.includes(item.question)}
                        >
                          <span className="font-semibold">{item.type}:</span>{" "}
                          {item.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                <p className="text-xl font-medium mb-3">
                  Choose a student profile
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {disabilityOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        disability === option.value
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-600 bg-zinc-800 hover:border-zinc-500 hover:bg-zinc-700"
                      }`}
                      onClick={() => setDisability(option.value)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            disability === option.value
                              ? "border-blue-500 bg-blue-500"
                              : "border-zinc-500"
                          }`}
                        >
                          {disability === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">
                            {option.title}
                          </h4>

                          <div className="text-sm text-gray-300">
                            <p className="mb-2 font-medium">
                              Learning considerations:
                            </p>

                            <ul className="space-y-1">
                              {option.characteristics.map((char, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <div className="bg-blue-400 w-1 h-1 rounded-full"></div>
                                  <span>{char}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex w-full gap-4 mt-8">
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
              <div className="flex flex-col">
                <div className="mb-6">
                  <p className="text-lg font-semibold">
                    Ready to Run Simulation
                  </p>
                  <p className="text-sm text-gray-300">
                    Review your setup below and run the simulation to see how
                    your selected student persona would respond to your
                    questions.
                  </p>
                </div>

                {/* Summary cards */}
                <div className="space-y-4 mb-6">
                  {/* Materials summary */}
                  <div className="border border-zinc-600 bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-x-2 mb-3">
                      <LuFiles className="w-5 h-5 text-blue-400" />
                      <h4 className="font-medium text-white">
                        Educational Materials
                      </h4>
                    </div>

                    <div className="text-sm text-white overflow-y-auto space-y-2">
                      {material.map((file, index) => (
                        <div
                          key={index}
                          className="px-2 py-2 bg-zinc-700 rounded-md"
                        >
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Questions summary */}
                  <div className="border border-zinc-600 bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-x-2 mb-3">
                      <BiPlus className="w-5 h-5 text-green-400" />
                      <h4 className="font-medium text-white">Test Questions</h4>
                    </div>

                    <div className="text-sm text-white">
                      <div className="overflow-y-auto space-y-2">
                        {testQuestions
                          .filter((q) => q.trim() !== "")
                          .map((question, index) => (
                            <div
                              key={index}
                              className="text-sm bg-zinc-700 px-2 py-2 rounded"
                            >
                              <span className="font-medium">Q{index + 1}:</span>{" "}
                              {question.substring(0, 80)}
                              {question.length > 80 && "..."}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Student persona summary */}
                  <div className="border border-zinc-600 bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-x-2 mb-3">
                      <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                      <h4 className="font-medium text-white">
                        Selected Student Persona
                      </h4>
                    </div>

                    <div className="text-sm text-gray-300">
                      <div className="flex items-center gap-x-2">
                        <img
                          src="/claire-profile.jpeg"
                          alt="Claire's Profile"
                          className="w-8 h-8 rounded-full border border-zinc-500"
                        />
                        <div>
                          <p className="text-white">
                            Claire - Student with{" "}
                            {disability === "adhd"
                              ? disability.toUpperCase()
                              : disability.charAt(0).toUpperCase() +
                                disability.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="font-semibold text-blue-300 mb-2">
                    What happens next?
                  </p>

                  <ul className="flex flex-col text-sm justify-center text-gray-300 space-y-2">
                    <li className="flex gap-x-2.5">
                      <span className="text-blue-400">1.</span>
                      <span>Claire will review your educational materials</span>
                    </li>
                    <li className="flex gap-x-2">
                      <span className="text-blue-400">2.</span>
                      <span>
                        She'll answer your test questions based on her learning
                        profile
                      </span>
                    </li>
                    <li className="flex items-start gap-x-2">
                      <span className="text-blue-400">3.</span>
                      <span>You'll receive detailed feedback and analysis</span>
                    </li>
                    <li className="flex items-start gap-x-2">
                      <span className="text-blue-400">4.</span>
                      <span>
                        Get suggestions for improving your educational content
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex w-full gap-4 mt-4">
                  <button
                    onClick={() => goToStep(3)}
                    className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-zinc-600 rounded hover:bg-zinc-500 cursor-pointer text-white"
                  >
                    <FaArrowLeftLong className="text-sm" />
                    Back
                  </button>
                  <button
                    onClick={() =>
                      getAnswers({
                        material,
                        testQuestions,
                        testAnswers,
                        disability,
                        pdfId,
                        setLoading,
                        router,
                      })
                    }
                    disabled={loading}
                    className="flex flex-row flex-grow text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                  >
                    {loading ? "Loading" : "Run Simulation"}
                    {loading ? (
                      <LoadingCircle />
                    ) : (
                      <FaArrowRightLong className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
