import { OpenAI } from "openai";

export interface ClassificationResult {
  isJobRelated: boolean;
  company?: string;
  role?: string;
  status?: "applied" | "interview" | "rejected" | "offer" | "other";
  confidence: number;
}

export async function classifyEmail(
  apiKey: string,
  subject: string,
  fromAddress: string
): Promise<ClassificationResult> {
  const openai = new OpenAI({ apiKey });

  const prompt = `Analyze this email and determine if it's job-application related.

Subject: ${subject}
From: ${fromAddress}

Respond with JSON only:
{
  "isJobRelated": boolean,
  "company": "company name if job related, null otherwise",
  "role": "job title if mentioned, null otherwise", 
  "status": "applied" | "interview" | "rejected" | "offer" | "other" | null,
  "confidence": 0.0 to 1.0
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content);
}
