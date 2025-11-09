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
      model: "claude-3-7-sonnet-latest",
      max_tokens: 1000,
      temperature: 0,
      system: `Using the student's responses to each question, provide feedback for the PDF material based on how well it conforms to Universal Design for Learning (UDL) and general accessibility.
      Also provide a list of actionable improvement suggestions to improve both the teaching content and the UDL conformity of the PDF material.

      **IMPORTANT:** Focus only on accessibility principles that apply to educational documents and PDFs. Do NOT include web-specific accessibility guidelines (such as WCAG web standards, HTML semantic elements, keyboard navigation, screen reader compatibility for websites, or other web-only features).
      **IMPORTANT:** These improvement suggestions should not be vague like "use UDL principles", they should be things that the user can do right now without having to search for what UDL principles are.

      Focus on document-specific improvements such as:
      - Font choices and sizing
      - Colour contrast
      - Document structure and organization
      - Visual layout and spacing
      - Content presentation methods
      - Alternative text descriptions for images in documents
      - Clear headings and formatting
      - Table of contents
      - Summaries after each topic
      - Glossaries for complicated vocabulary
      - Consistent formatting and styles
      - Use of plain language and clear instructions

      Use web search to search for accessibility guidelines and UDL principles.

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
