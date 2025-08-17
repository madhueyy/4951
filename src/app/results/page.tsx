"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeftLong,
  FaChevronDown,
  FaChevronUp,
  FaRegFilePdf,
} from "react-icons/fa6";

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

  useEffect(() => {
    // Get data from localStorage and set states
    const response = localStorage.getItem("simulationResponse");
    const questions = localStorage.getItem("simulationQuestions");
    const answers = localStorage.getItem("simulationAnswers");
    const scores = localStorage.getItem("simulationScores");
    const scoresFeedback = localStorage.getItem("simulationScoresFeedback");
    const disabilityChosen = localStorage.getItem("simulationDisability");

    if (
      response &&
      questions &&
      answers &&
      scores &&
      scoresFeedback &&
      disabilityChosen
    ) {
      setResponse(JSON.parse(response));
      setTestQuestions(JSON.parse(questions));
      setTestAnswers(JSON.parse(answers));
      setTestScores(
        JSON.parse(scores).map((score: string) => parseInt(score.split("/")[0]))
      );
      setTestScoresFeedback(JSON.parse(scoresFeedback));
      setDisability(disabilityChosen);
    }
  }, []);

  // Reset everything and redirect to start page
  const resetSimulation = () => {
    localStorage.removeItem("simulationResponse");
    localStorage.removeItem("simulationQuestions");
    localStorage.removeItem("simulationAnswers");
    localStorage.removeItem("simulationScores");
    localStorage.removeItem("simulationDisability");
    router.push("/");
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

  return (
    <main className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] flex flex-col items-center pt-12 px-4 bg-zinc-800">
      <h2 className="text-3xl font-semibold mb-2">
        Simulated Student's Responses
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

      <div className="flex flex-col lg:flex-row gap-x-4 w-full max-w-6xl mt-8">
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[66vh]">
          {/* Each response card */}
          {response.map((answer, index) => (
            <div
              key={index}
              className="border bg-zinc-700 border-zinc-600 rounded-lg overflow-hidden"
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
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">
                      Feedback:
                    </h4>
                    <div className="bg-zinc-800 p-3 rounded">
                      <p className="text-gray-200">
                        {testScoresFeedback[index] || "No feedback available"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Simulated student's profile */}
        <div className="lg:w-80">
          <div className="sticky top-4">
            <div className="p-6 border bg-zinc-700 border-zinc-600 rounded-lg text-white">
              <div className="flex flex-col items-center text-center mb-6">
                <img
                  src="/default-profile.png"
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
                  <span className="text-right">{disability.toUpperCase()}</span>
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
                        : "Needs Improvement"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col p-4 mb-6 w-full max-w-5xl rounded-lg border bg-zinc-700 border-zinc-600 text-white">
        <p className="text-xl font-semibold mb-2">
          Your Uploaded Educational Material
        </p>
        {material.length > 0 ? (
          material.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-zinc-600 rounded-md mt-2"
            >
              <FaRegFilePdf className="w-6 h-6 text-blue-400" />
              <span className="text-md font-medium">{file.name}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No material uploaded yet.</p>
        )}
      </div> */}

      <button
        className="flex flex-row text-center items-center justify-center gap-x-4 my-6 py-2 px-4 font-medium bg-blue-500 rounded hover:bg-blue-600 cursor-pointer text-white"
        onClick={resetSimulation}
      >
        <FaArrowLeftLong className="text-sm" />
        Upload New Material
      </button>
    </main>
  );
}

export default Page;
