import { Dispatch, SetStateAction } from "react";

export interface SimulationParams {
  material: File[];
  testQuestions: string[];
  testAnswers: string[];
  disability: string;
  pdfId?: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  router: any;
}

// Function to get response from simulate student
export const getAnswers = async ({
  material,
  testQuestions,
  testAnswers,
  disability,
  pdfId,
  setLoading,
  router,
}: SimulationParams) => {
  if (!material.length || !testQuestions.length || !disability) {
    alert("Please provide all required inputs.");
    return;
  }

  try {
    setLoading(true);
    const formData = new FormData();
    material.forEach((file) => formData.append("material", file));
    formData.append("questions", JSON.stringify(testQuestions));
    formData.append("disability", disability);
    if (pdfId) formData.append("pdfId", pdfId);

    const res = await fetch("/api/material", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    const fullText = data.output.text;
    const jsonMatch = fullText.match(/\[\s*".*?"\s*(?:,\s*".*?"\s*)*\]/);

    const parsedResponses: string[] = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : [fullText];

    localStorage.setItem("simulationResponse", JSON.stringify(parsedResponses));
    localStorage.setItem("simulationQuestions", JSON.stringify(testQuestions));
    localStorage.setItem("simulationAnswers", JSON.stringify(testAnswers));
    localStorage.setItem("simulationDisability", disability);

    await evaluateAnswers({ parsedResponses, testQuestions, testAnswers });
    await evaluateWCAGAndUDL({ parsedResponses, testQuestions, material });

    router.push("/results");
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Evaluate answers function
export const evaluateAnswers = async ({
  parsedResponses,
  testQuestions,
  testAnswers,
}: {
  parsedResponses: string[];
  testQuestions: string[];
  testAnswers: string[];
}) => {
  if (!testQuestions.length || !testAnswers.length) {
    alert("Please provide test questions and answers.");
    return;
  }

  try {
    const res = await fetch("/api/scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questions: testQuestions,
        answers: testAnswers,
        studentResponses: parsedResponses,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const fullText = data.output.text;
    const scoreRegex = /"Question \d+":\s*"(\d+\/\d+)"/g;
    const feedbackRegex = /"Question \d+ Feedback":\s*"([^"]*)"/g;

    const scores = [...fullText.matchAll(scoreRegex)].map((match) => match[1]);
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

// Evaluate WCAG & UDL function
export const evaluateWCAGAndUDL = async ({
  parsedResponses,
  testQuestions,
  material,
}: {
  parsedResponses: string[];
  testQuestions: string[];
  material: File[];
}) => {
  if (!testQuestions.length || !material.length) {
    alert("Please provide all required inputs.");
    return;
  }

  const formData = new FormData();
  material.forEach((file) => formData.append("material", file));
  formData.append("questions", JSON.stringify(testQuestions));
  formData.append("studentResponses", JSON.stringify(parsedResponses));

  try {
    const res = await fetch("/api/improvement", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    let combinedText = "";
    data.output.forEach((item: any) => {
      if (item.type === "text" && item.text) combinedText += item.text;
    });

    const jsonMatch = combinedText.match(
      /\{\s*"feedback":\s*"([\s\S]*?)",\s*"improvement":\s*"([\s\S]*?)"\s*\}/
    );

    if (jsonMatch) {
      try {
        const feedback = jsonMatch[1].replace(/\\"/g, "").trim();
        const improvement = jsonMatch[2].replace(/\\"/g, "").trim();
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
