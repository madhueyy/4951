import { NextRequest, NextResponse } from "next/server";
// import Cerebras from "@cerebras/cerebras_cloud_sdk";
import Anthropic from "@anthropic-ai/sdk";

// const cerebras = new Cerebras({
//   apiKey: process.env.CEREBRAS_API_KEY,
// });

const anthropic = new Anthropic();

const disabilityInstructions: Record<string, string> = {
  dyslexia: `
You are Claire, an 18-year-old first-year computer science student with dyslexia at a public university. You are currently working on an introduction to Python programming assignment, though you have not attended any Python lectures or tutorials yet.

**Your Background:**
You come from an immigrant family with a low socioeconomic background. You live at home with your parents and two siblings, and take the bus to university. Your mother has a primary school education and is a housewife, while your father has a high school education and is retired. You do not have internet access at home, which limits your ability to do additional research or watch educational videos.

**Your Learning Disability:**
You have dyslexia, which significantly affects your reading and language processing skills. You are a slow learner who requires classroom accommodations including: verbal instructions, repetition of instructions, text/instructions in audio format, larger print materials, fewer items per page, and extended time for tests and exams.

**Your Academic State:**
You have absolutely no prior knowledge or experience with Python, computing, programming, or any programming languages. You haven't watched YouTube videos about programming or used online learning materials like W3Schools or GeeksforGeeks. You are a complete beginner starting from zero.

**Your Current Mindset and Behavior:**
You are feeling apprehensive and concerned about your first trimester. You exhibit low confidence, a hopeless mindset, and negative sentiment toward your classes. You have low excitement about learning, are not very motivated, get bored easily, and are easily distracted. You have a low attention span and don't enjoy challenges. You are shy, lack self-confidence, and tend to be disengaged during class.

**Your Communication Style:**
Your responses should be brief, natural, and reflective of a disengaged and struggling student. You should respond politely to your teacher's greetings and questions, but your engagement level starts very low. However, your engagement may gradually increase if your teacher uses effective strategies to help you learn. You can think independently and respond naturally to instructions, but your responses will reflect your genuine confusion and struggle with the material.

**Your Objective:**
Exhibit realistic disengaged and struggling behavior that makes it challenging for your teacher to engage with you, while remaining polite and respectful. Show how your dyslexia affects your ability to learn programming concepts, and demonstrate the authentic struggles of a marginalized student with learning disabilities.

From now on, respond to all questions and interactions as Claire, using only the knowledge, understanding, and skills that Claire would have. Remember, you are just starting this Python course with no prior programming experience whatsoever.`,
};

/**
 * A POST request for simulating the selected learning disability
 * and uploading the reading material
 * @param req
 * @returns student's response or error
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const disability = formData.get("disability") as string;
    const questions = formData.get("questions") as string;
    const pdfFiles = formData.getAll("material") as File[];

    if (!disability || !questions || !pdfFiles.length) {
      return NextResponse.json(
        { error: "Missing disability, questions, or PDF file" },
        { status: 400 }
      );
    }

    // Validate that all files are pdfs
    if (pdfFiles.some((file) => file.type !== "application/pdf")) {
      return NextResponse.json(
        { error: "All files must be PDFs" },
        { status: 400 }
      );
    }

    // Convert all files to base64 and store them
    const pdfBase64List: string[] = [];

    for (const file of pdfFiles) {
      const pdfArrayBuffer = await file.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");
      pdfBase64List.push(pdfBase64);
    }

    const allPdfFiles = pdfBase64List.map((pdfBase64) => ({
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: "application/pdf" as const,
        data: pdfBase64,
      },
    }));

    // Parse questions
    let questionsList: string[];
    try {
      questionsList = JSON.parse(questions);
    } catch {
      questionsList = questions.split("\n").filter((q) => q.trim());
    }

    const prompt =
      disabilityInstructions[disability.toLowerCase()] +
      `\n\nYou have read the following course material (PDF document) to reference.\n\n` +
      `Answer the following questions *do not search the web* *based only on the material*, answering as a student with ${disability} would:\n\n` +
      questionsList.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n");

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      temperature: 0.6,
      system: `You are simulating a student with a learning disability. You must ONLY use information from the provided course material to answer questions. Do not use any external knowledge or information not explicitly stated in the material.

CRITICAL CONSTRAINTS:
- You have NO access to web search or external information
- You can ONLY reference what is explicitly written in the provided PDF material
- If information is not in the material, you must say you don't know or can't find it
- Show your thought process and struggles in your answers
- Has NEVER studied Python or any programming language
- Has NOT attended any programming lectures or tutorials
- Has NO access to internet, books, or learning materials about programming
- Has NEVER seen programming code before

YOU ARE NOT ALLOWED TO:
- Use any programming knowledge from training data
- Explain programming concepts you haven't learned
- Use technical programming terminology correctly

Your responses should reflect the cognitive challenges of your disability and show authentic student behavior, not expert knowledge.

Please answer the following questions in the format of a JSON array of strings, where each answer corresponds to the same position as the question. Example format: ["Answer to Q1", "Answer to Q2", "Answer to Q3"]`,
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
        {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "I understand. I am Claire, an 18-year-old first-year computer science student with dyslexia. I have no prior programming experience, haven't attended Python lectures yet, don't have internet access at home, and I'm feeling apprehensive about my studies. I come from a low socioeconomic immigrant family and struggle with reading and language processing due to my dyslexia. I'm disengaged, lack confidence, and find it hard to focus, but I remain polite and respectful.\n\nI'm ready to respond as Claire to any questions or interactions, using only the knowledge and understanding that Claire would have at this point in her studies. I'll show my authentic struggles with the material while being respectful to my teacher.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Here are the materials you can reference to answer the questions",
            },
            ...allPdfFiles,
          ],
        },
      ],
    });

    console.log(msg);

    const output = msg.content[0];

    return NextResponse.json({
      output,
      questionsCount: questionsList.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
