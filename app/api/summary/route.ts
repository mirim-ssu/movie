import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { text, title } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    // 모델명은 계정/시점에 따라 다를 수 있음(확실하지 않음).
    // 만약 "model not found"가 뜨면 다른 모델명으로 바꿔야 함.
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const prompt = [
        "다음 영화 줄거리를 한국어로 **한 문장**으로 요약해줘.",
        "마침표 하나로 끝내고, 매우 간결하게.",
        title ? `제목: ${title}` : "",
        `줄거리: ${text}`,
    ].join("\n");

    // Responses API 사용 (권장 엔드포인트) :contentReference[oaicite:1]{index=1}
    const resp = await client.responses.create({
      model,
      input: prompt,
    });

    // SDK에서 output_text 제공 (환경에 따라 타입 경고가 있을 수 있음: 확실하지 않음)
    const summary = (resp as any).output_text?.trim?.() || "";

    return NextResponse.json({ summary });
  } catch (e: any) {
    return NextResponse.json(
      { error: "summary failed", detail: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}