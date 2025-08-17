import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { questions, answers, studentResponses } = await req.json();

    if (!questions || !answers || !studentResponses) {
      return NextResponse.json(
        { error: "Missing questions, answers, or student responses" },
        { status: 400 }
      );
    }

    let prompt = "";
    for (let i = 0; i < questions.length; i++) {
      prompt += `Question ${i + 1}: ${questions[i]}\n`;
      prompt += `Correct Answer: ${answers[i]}\n`;
      prompt += `Student Response: ${studentResponses[i]}\n\n`;
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0,
      system: `For each question, evaluate the student's response and provide a score from 0 to 10 based on how correct it is in comparison to the correct answer.
Also provide feedback for each question, explaining the score given and any improvements that could be made to the teaching material based on what the student mentions about the materials in their response.

**FORMAT:**
Format your questions and answers with the following structure:

{"Question 1": "Score out of 10 for Question 1",
"Question 1 Feedback": "Feedback for Question 1",
"Question 2": "Score out of 10 for Question 2",
"Question 2 Feedback": "Feedback for Question 2",
"Question 3": "Score out of 10 for Question 3",
"Question 3 Feedback": "Feedback for Question 3",
"Question 4": "Score out of 10 for Question 4",
"Question 4 Feedback": "Feedback for Question 4",
}`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    console.log(msg);

    const output = msg.content[0];

    return NextResponse.json({
      output,
    });
  } catch (error) {
    console.error("Error in scoring route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
