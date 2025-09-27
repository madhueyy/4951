import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const questions = formData.get("questions") as string;
    const studentResponses = formData.get("studentResponses") as string;
    const pdfFiles = formData.getAll("material") as File[];

    if (!questions || !studentResponses || !pdfFiles.length) {
      return NextResponse.json(
        { error: "Missing questions, student responses, or PDF file" },
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

    let prompt = "";
    for (let i = 0; i < questions.length; i++) {
      prompt += `Question ${i + 1}: ${questions[i]}\n`;
      prompt += `Student Response: ${studentResponses[i]}\n\n`;
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0,
      system: `Using the student's responses to each question, provide feedback for the PDF material based on how well it conforms to Universal Design for Learning (UDL) and Web Content Accessibility Guidelines (WCAG).
      Also provide a list of improvement suggestions to improve the WCAG and UDL conformity of the PDF material. Use web search to search for WCAG and UDL principles, please keep in mind that these are PDF files and not web pages so not all WCAG points will apply (no need to mention if it does not apply).

**FORMAT:**
Format your feedback and improvement with the following structure:

{"feedback": "Feedback",
"improvement": "Improvement",
}`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            ...allPdfFiles,
          ],
        },
      ],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 2,
        },
      ],
    });

    console.log(msg);

    const output = msg.content;

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
