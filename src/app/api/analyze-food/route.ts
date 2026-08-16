import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Kamu adalah ahli gizi yang menganalisis foto makanan. Lihat foto yang diberikan, kenali setiap item makanan/minuman yang terlihat, perkirakan porsinya dalam gram, dan hitung estimasi kalori serta makronutrien totalnya. Kalau bukan foto makanan, tetap isi field dengan estimasi terbaikmu dan set confidence ke "low". Selalu jawab dalam Bahasa Indonesia untuk field teks.`;

const RESPONSE_SCHEMA = {
  name: "food_analysis",
  strict: true,
  schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "Ringkasan singkat isi piring, 1 kalimat" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            estimatedGrams: { type: "number" },
            calories: { type: "number" },
          },
          required: ["name", "estimatedGrams", "calories"],
          additionalProperties: false,
        },
      },
      totalCalories: { type: "number" },
      protein: { type: "number", description: "gram" },
      carbs: { type: "number", description: "gram" },
      fat: { type: "number", description: "gram" },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
    },
    required: ["summary", "items", "totalCalories", "protein", "carbs", "fat", "confidence"],
    additionalProperties: false,
  },
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY belum diset di .env.local" },
      { status: 500 }
    );
  }

  const { imageDataUrl } = await request.json();
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "imageDataUrl tidak valid" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analisis foto makanan ini." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "Tidak ada respons dari AI" }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    console.error("analyze-food error", err);
    return NextResponse.json({ error: "Gagal menganalisis foto" }, { status: 500 });
  }
}
