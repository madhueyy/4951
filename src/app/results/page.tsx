"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaUniversalAccess,
  FaLightbulb,
} from "react-icons/fa6";
import Navbar from "../components/Navbar";
import { getAnswers } from "../utils/simulation";
import LoadingCircle from "../components/LoadingCircle";

function Page() {
  const router = useRouter();
  const [response, setResponse] = useState<string[]>([]);
  const [testQuestions, setTestQuestions] = useState<string[]>([]);
  const [testAnswers, setTestAnswers] = useState<string[]>([]);
  const [testScores, setTestScores] = useState<number[]>([]);
  const [testScoresFeedback, setTestScoresFeedback] = useState<string[]>([]);
  const [disability, setDisability] = useState<string>("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [WCAGAndUDLFeedback, SetWCAGAndUDLFeedback] = useState<string>("");
  const [improvementSuggestions, SetImprovementSuggestions] =
    useState<string>("");
  const [material, setMaterial] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();

    console.log(disability);
  }, []);

  const loadData = () => {
    // Get data from localStorage and set states
    const response = localStorage.getItem("simulationResponse");
    const questions = localStorage.getItem("simulationQuestions");
    const answers = localStorage.getItem("simulationAnswers");
    const scores = localStorage.getItem("simulationScores");
    const scoresFeedback = localStorage.getItem("simulationScoresFeedback");
    const disabilityChosen = localStorage.getItem("simulationDisability");
    const WCAGAndUDLFeedback = localStorage.getItem("WCAGAndUDLFeedback");
    const improvementSuggestions = localStorage.getItem("improvement");

    if (
      response &&
      questions &&
      answers &&
      scores &&
      scoresFeedback &&
      disabilityChosen &&
      WCAGAndUDLFeedback &&
      improvementSuggestions
    ) {
      setResponse(JSON.parse(response));
      setTestQuestions(JSON.parse(questions));
      setTestAnswers(JSON.parse(answers));
      setTestScores(
        JSON.parse(scores).map((score: string) => parseInt(score.split("/")[0]))
      );
      setTestScoresFeedback(JSON.parse(scoresFeedback));
      setDisability(disabilityChosen);
      SetWCAGAndUDLFeedback(WCAGAndUDLFeedback);
      SetImprovementSuggestions(improvementSuggestions);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    if (score >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return "bg-green-500/20 border-green-500/30";
    if (score >= 6) return "bg-yellow-500/20 border-yellow-500/30";
    if (score >= 4) return "bg-orange-500/20 border-orange-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const calculateAverageScore = () => {
    if (testScores.length === 0) {
      return 0;
    }

    const total = testScores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / testScores.length) * 10) / 10;
  };

  const handleRerun = async () => {
    if (!material.length) {
      alert("Please upload improved material first.");
      return;
    }

    try {
      setLoading(true);

      await getAnswers({
        material: material,
        testQuestions: testQuestions,
        testAnswers: testAnswers,
        disability: disability,
        setLoading: setLoading,
        router: router,
      });

      loadData();
      setMaterial([]);
    } catch (error) {
      console.error("Error rerunning simulation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] bg-zinc-800">
        <Navbar />

        <div className="flex flex-col items-center pt-12 px-4">
          <h2 className="text-3xl font-semibold mb-2">
            Simulation Responses & Feedback
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-lg">Overall Score:</span>
            <div className="px-4 py-2 rounded-lg bg-zinc-500 animate-pulse">
              <span className="text-xl font-bold text-zinc-500 animate-pulse">
                0/10
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-x-6 my-8">
            <div className="flex flex-col gap-y-6">
              {/* WCAG & UDL */}
              <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback section */}
                <div className="border bg-zinc-700 border-zinc-600 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaUniversalAccess className="w-5 h-5 text-green-400" />
                    <h3 className="text-xl font-bold text-green-400">
                      WCAG & UDL Feedback
                    </h3>
                  </div>
                  <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line h-64 bg-zinc-500 animate-pulse rounded-md"></div>
                </div>

                {/* Improvement section */}
                <div className="border bg-zinc-700 border-zinc-600 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaLightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-yellow-400">
                      Improvement Suggestions
                    </h3>
                  </div>
                  <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line h-64 bg-zinc-500 animate-pulse rounded-md"></div>
                </div>
              </div>

              {/* Questions and answers */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Each response card */}
                {response.map((answer, index) => (
                  <div
                    key={index}
                    className="max-w-3xl border bg-zinc-700 border-zinc-600 rounded-lg overflow-hidden"
                  >
                    {/* Question header */}
                    <div
                      className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-zinc-600 transition-colors"
                      onClick={() => toggleExpanded(index)}
                    >
                      <div className="flex items-center gap-x-4">
                        <h3 className="text-lg font-semibold text-blue-400">
                          Question {index + 1}
                        </h3>

                        {/* Score out of 10 */}
                        <div
                          className={`px-3 py-1 rounded-full border text-sm font-medium bg-zinc-500 text-zinc-500 animate-pulse`}
                        >
                          <span>{testScores[index] || 0}/10</span>
                        </div>
                      </div>

                      {/* Expand/collapse button */}
                      {expandedQuestions.has(index) ? (
                        <FaChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FaChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {/* Question text */}
                    <div className="px-4 pt-4 pb-4">
                      <p className="text-gray-300 text-md font-semibold">
                        {testQuestions[index] || "Question text not available"}
                      </p>
                    </div>

                    {/* Expanded content */}
                    {expandedQuestions.has(index) && (
                      <div className="border-t border-zinc-600 p-4 space-y-4">
                        {/* Correct answer */}
                        <div>
                          <h4 className="text-sm font-semibold text-green-400 mb-2">
                            Correct Answer:
                          </h4>
                          <p className="text-gray-200 bg-zinc-800 p-3 rounded">
                            {testAnswers[index] || "Answer text not available"}
                          </p>
                        </div>

                        {/* Student's response */}
                        <div>
                          <h4 className="text-sm font-semibold text-orange-400 mb-2">
                            Student's Response:
                          </h4>
                          <p className="p-3 rounded bg-zinc-500 text-zinc-500 animate-pulse">
                            {answer}
                          </p>
                        </div>

                        {/* Feedback */}
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                            Evaluation:
                          </h4>
                          <div className="p-3 rounded bg-zinc-500 text-zinc-500 animate-pulse">
                            <p className="leading-relaxed whitespace-pre-line">
                              {testScoresFeedback[index] ||
                                "No feedback available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated student's profile */}
            <div className="sticky top-4 h-fit">
              <div className="lg:w-80">
                <div className="p-6 border bg-zinc-700 border-zinc-600 rounded-lg text-white">
                  <div className="flex flex-col items-center text-center mb-6">
                    <img
                      src="/claire-profile.jpeg"
                      alt="Claire's Profile Picture"
                      className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
                    />
                    <h3 className="text-xl font-bold mb-2">Claire's Profile</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">Age:</span>
                      <span>18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">
                        Degree:
                      </span>
                      <span>Computer Science</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">
                        Stage:
                      </span>
                      <span>First Year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">
                        Learning Disability:
                      </span>
                      <span className="text-right">
                        {disability === "adhd"
                          ? disability.toUpperCase()
                          : disability.charAt(0).toUpperCase() +
                            disability.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-600">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">
                          Questions Answered:
                        </span>
                        <span>{response.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">
                          Average Score:
                        </span>
                        <span className="bg-zinc-500 text-zinc-500 animate-pulse rounded-sm">
                          0/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">
                          Performance Level:
                        </span>
                        <span className="bg-zinc-500 text-zinc-500 animate-pulse rounded-sm">
                          {calculateAverageScore() >= 8
                            ? "Excellent"
                            : calculateAverageScore() >= 6
                            ? "Good"
                            : calculateAverageScore() >= 4
                            ? "Fair"
                            : "Developing"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 border border-zinc-600 p-4 rounded-lg bg-zinc-700">
                <p className="font-semibold text-white">
                  Upload Improved Material
                </p>

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-30 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 bg-gray-700 border-gray-600 hover:border-gray-500">
                    <svg
                      className="w-5 h-5 mb-4 text-gray-500 dark:text-gray-400"
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
                  disabled={loading || !material.length}
                  className="flex flex-row gap-x-2 items-center justify-center w-full py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                >
                  {loading ? "Loading" : "Rerun Simulation"}
                  {loading && <LoadingCircle />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] bg-zinc-800">
      <Navbar />

      <div className="flex flex-col items-center pt-12 px-4">
        <h2 className="text-3xl font-semibold mb-2">
          Simulation Responses & Feedback
        </h2>
        <div className="flex items-center justify-center gap-4">
          <span className="text-lg">Overall Score:</span>
          <div
            className={`px-4 py-2 rounded-lg border ${getScoreBackground(
              calculateAverageScore()
            )}`}
          >
            <span
              className={`text-xl font-bold ${getScoreColor(
                calculateAverageScore()
              )}`}
            >
              {calculateAverageScore()}/10
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-x-6 my-8">
          <div className="flex flex-col gap-y-6">
            {/* WCAG & UDL */}
            <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback section */}
              <div className="border bg-zinc-700 border-zinc-600 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaUniversalAccess className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-bold text-green-400">
                    WCAG & UDL Feedback
                  </h3>
                </div>
                <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                  {WCAGAndUDLFeedback.replace(/\\n/g, "\n").replace(`"`, "")}
                </div>
              </div>

              {/* Improvement section */}
              <div className="border bg-zinc-700 border-zinc-600 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-bold text-yellow-400">
                    Improvement Suggestions
                  </h3>
                </div>
                <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
                  {improvementSuggestions
                    .replace(/\\n/g, "\n")
                    .replace(`"`, "")}
                </div>
              </div>
            </div>

            {/* Questions and answers */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {/* Each response card */}
              {response.map((answer, index) => (
                <div
                  key={index}
                  className="max-w-3xl border bg-zinc-700 border-zinc-600 rounded-lg overflow-hidden"
                >
                  {/* Question header */}
                  <div
                    className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-zinc-600 transition-colors"
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className="flex items-center gap-x-4">
                      <h3 className="text-lg font-semibold text-blue-400">
                        Question {index + 1}
                      </h3>

                      {/* Score out of 10 */}
                      <div
                        className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreBackground(
                          testScores[index] || 0
                        )}`}
                      >
                        <span className={getScoreColor(testScores[index] || 0)}>
                          {testScores[index] || 0}/10
                        </span>
                      </div>
                    </div>

                    {/* Expand/collapse button */}
                    {expandedQuestions.has(index) ? (
                      <FaChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FaChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Question text */}
                  <div className="px-4 pt-4 pb-4">
                    <p className="text-gray-300 text-md font-semibold">
                      {testQuestions[index] || "Question text not available"}
                    </p>
                  </div>

                  {/* Expanded content */}
                  {expandedQuestions.has(index) && (
                    <div className="border-t border-zinc-600 p-4 space-y-4">
                      {/* Correct answer */}
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-2">
                          Correct Answer:
                        </h4>
                        <p className="text-gray-200 bg-zinc-800 p-3 rounded">
                          {testAnswers[index] || "Answer text not available"}
                        </p>
                      </div>

                      {/* Student's response */}
                      <div>
                        <h4 className="text-sm font-semibold text-orange-400 mb-2">
                          Student's Response:
                        </h4>
                        <p className="text-gray-200 bg-zinc-800 p-3 rounded">
                          {answer}
                        </p>
                      </div>

                      {/* Feedback */}
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                          Evaluation:
                        </h4>
                        <div className="bg-zinc-800 p-3 rounded">
                          <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                            {testScoresFeedback[index] ||
                              "No feedback available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Simulated student's profile */}
          <div className="sticky top-4 h-fit">
            <div className="lg:w-80">
              <div className="p-6 border bg-zinc-700 border-zinc-600 rounded-lg text-white">
                <div className="flex flex-col items-center text-center mb-6">
                  <img
                    src="/claire-profile.jpeg"
                    alt="Claire's Profile Picture"
                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
                  />
                  <h3 className="text-xl font-bold mb-2">Claire's Profile</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-300">Age:</span>
                    <span>18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-300">Degree:</span>
                    <span>Computer Science</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-300">Stage:</span>
                    <span>First Year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-300">
                      Learning Disability:
                    </span>
                    <span className="text-right">
                      {disability === "adhd"
                        ? disability.toUpperCase()
                        : disability.charAt(0).toUpperCase() +
                          disability.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-600">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">
                        Questions Answered:
                      </span>
                      <span>{response.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">
                        Average Score:
                      </span>
                      <span className={getScoreColor(calculateAverageScore())}>
                        {calculateAverageScore()}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-300">
                        Performance Level:
                      </span>
                      <span className={getScoreColor(calculateAverageScore())}>
                        {calculateAverageScore() >= 8
                          ? "Excellent"
                          : calculateAverageScore() >= 6
                          ? "Good"
                          : calculateAverageScore() >= 4
                          ? "Fair"
                          : "Developing"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 border border-zinc-600 p-4 rounded-lg bg-zinc-700">
              <p className="font-semibold text-white">
                Upload Improved Material
              </p>

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-30 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 bg-gray-700 border-gray-600 hover:border-gray-500">
                  <svg
                    className="w-5 h-5 mb-4 text-gray-500 dark:text-gray-400"
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
                disabled={loading || !material.length}
                className="flex flex-row gap-x-2 items-center justify-center w-full py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
                onClick={handleRerun}
              >
                {loading ? "Loading" : "Rerun Simulation"}
                {loading && <LoadingCircle />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Page;
