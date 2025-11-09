import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFiles = formData.getAll("material") as File[];

    if (!pdfFiles.length) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
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

    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-latest",
      max_tokens: 1000,
      temperature: 0,
      system: `Based on the following pdf file, generate comprehensive Bloom's taxonomy questions and answers for each of the six levels. Provide 1 question per level and format your response clearly:

**INSTRUCTIONS:**
Generate questions for each Bloom's Taxonomy level:

1. **REMEMBER** (Recall facts and basic concepts)
2. **UNDERSTAND** (Explain ideas or concepts)
3. **APPLY** (Use information in new situations)
4. **ANALYZE** (Draw connections among ideas)
5. **EVALUATE** (Justify a stand or decision)
6. **CREATE** (Produce new or original work)

**FORMAT:**
Please return the response as valid JSON with all strings properly escaped.
Ensure that newlines are represented as \\n, quotes are escaped as \\", and all other special characters are properly escaped for JSON parsing.
Format your questions and answers with the following structure:

{"Remember": "Question for Remember level",
"Remember Answer": "Answer for Remember level",
"Understand": "Question for Understand level",
"Understand Answer": "Answer for Understand level",
"Apply": "Question for Apply level",
"Apply Answer": "Answer for Apply level",
"Analyze": "Question for Analyze level",
"Analyze Answer": "Answer for Analyze level",
"Evaluate": "Question for Evaluate level",
"Evaluate Answer": "Answer for Evaluate level",
"Create": "Question for Create level",
"Create Answer": "Answer for Create level"}`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Here are the materials you can reference to generate the questions",
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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
