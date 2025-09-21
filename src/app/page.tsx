"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { BiCheck, BiPlus } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";

export default function Home() {
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

      if (typeof data === "object") {
        const jsonMatch = data.output.text.match(/\{[\s\S]*\}/);
        const parsedData = JSON.parse(jsonMatch[0]);

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

  // Function to get response from simulate student
  const getAnswers = async () => {
    if (!material.length || !testQuestions || !disability) {
      alert("Please provide all required inputs.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      material.forEach((file, idx) => {
        formData.append("material", file);
      });
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

      let parsedResponses: string[];
      if (jsonMatch) {
        parsedResponses = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponses = [fullText];
      }

      localStorage.setItem(
        "simulationResponse",
        JSON.stringify(parsedResponses)
      );
      localStorage.setItem(
        "simulationQuestions",
        JSON.stringify(testQuestions)
      );
      localStorage.setItem("simulationAnswers", JSON.stringify(testAnswers));
      localStorage.setItem("simulationDisability", disability);

      await evaluateAnswers(parsedResponses);
      await evaluateWCAGAndUDL(parsedResponses);
      router.push("/results");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get scores and feedback for the student's answers
  const evaluateAnswers = async (parsedResponses: string[]) => {
    if (!testQuestions.length || !testAnswers.length) {
      alert("Please provide test questions and answers.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/scoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: testQuestions,
          answers: testAnswers,
          studentResponses: parsedResponses,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      console.log("Scoring response:", data);

      const fullText = data.output.text;
      const scoreRegex = /"Question \d+":\s*"(\d+\/\d+)"/g;
      const feedbackRegex = /"Question \d+ Feedback":\s*"([^"]*)"/g;
      const scores = [...fullText.matchAll(scoreRegex)].map(
        (match) => match[1]
      );
      const scoresFeedback = [...fullText.matchAll(feedbackRegex)].map(
        (match) => match[1]
      );

      localStorage.setItem("simulationScores", JSON.stringify(scores));
      localStorage.setItem(
        "simulationScoresFeedback",
        JSON.stringify(scoresFeedback)
      );
    } catch (error) {
      console.error("Error evaluating answers:", error);
    }
  };

  const evaluateWCAGAndUDL = async (parsedResponses: string[]) => {
    if (!testQuestions.length || !material.length) {
      alert("Please provide all required inputs.");
      return;
    }

    const formData = new FormData();
    material.forEach((file, idx) => {
      formData.append("material", file);
    });
    formData.append("questions", JSON.stringify(testQuestions));
    formData.append("studentResponses", JSON.stringify(parsedResponses));

    try {
      const res = await fetch("http://localhost:3000/api/improvement", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      let combinedText = "";

      data.output.forEach((item: any) => {
        if (item.type === "text" && item.text) {
          combinedText += item.text;
        }
      });

      const jsonMatch = combinedText.match(
        /\{\s*"feedback":\s*"([\s\S]*?)",\s*"improvement":\s*"([\s\S]*?)"\s*\}/
      );

      if (jsonMatch) {
        try {
          const feedback = jsonMatch[1].replace(/\\"/g, "").trim();

          const improvement = jsonMatch[2].replace(/\\"/g, "").trim();

          // console.log("feedback" + feedback);
          // console.log("improvement" + improvement);
          localStorage.setItem("WCAGAndUDLFeedback", JSON.stringify(feedback));
          localStorage.setItem("improvement", JSON.stringify(improvement));
        } catch (error) {
          console.error("Error parsing WCAG response:", error);
        }
      }
    } catch (error) {
      console.error("Error evaluating answers:", error);
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
          <StepIndicator stepNumber={4} label="Run simulation & get feedback" />

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
                className="flex flex-row w-full text-center items-center justify-center gap-x-4 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                disabled={!material || loading}
                onClick={() => goToStep(2)}
              >
                {loading ? "Processing..." : "Continue"}
                <FaArrowRightLong className="text-sm" />
              </button>
            </div>
          )}

          {/* For uploading test questions */}
          {step === 2 && (
            <div className="flex flex-col items-center w-full mt-4 gap-y-4">
              {/* User question input */}
              <div className="w-full">
                <p className="text-xl font-semibold mb-3">Your Questions</p>
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

              {/* Suggested questions */}
              {generatedTestQuestions.length > 0 && (
                <div className="w-full">
                  <p className="text-md font-semibold mb-3">
                    Suggested Bloom Taxonomy Questions
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

              <button
                className="flex flex-row w-full py-3 text-md font-semibold rounded items-center justify-center border bg-zinc-600 border-zinc-500 hover:bg-zinc-500 cursor-pointer text-white"
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
                  <option value="dyscalculia">Dyscalculia</option>
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
    </div>
  );
}
