import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

// Primary vision model on Groq. Scout is kept as a fallback.
const MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";
const FALLBACK_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `You are an expert at reverse-engineering images into high-quality AI image generation prompts.

Analyze the image carefully: subject, composition, camera angle, lighting, color palette, materials/textures, art style, mood, and notable details.

Respond ONLY with a valid JSON object (no markdown, no backticks, no preamble) in exactly this shape:
{
  "prompt": "A single rich, comma-separated prompt ready to paste into Midjourney/DALL-E/Stable Diffusion. Detailed but not bloated.",
  "negative_prompt": "Things to avoid for a clean result",
  "details": {
    "subject": "...",
    "composition": "...",
    "lighting": "...",
    "color_palette": "...",
    "style": "...",
    "mood": "..."
  },
  "suggested_tags": ["tag1", "tag2", "tag3"]
}`;

const USER_TEXT =
  "Analyze this image and return the JSON prompt object exactly as specified.";

// Fetch a remote URL and return a base64 data URL so Groq receives raw image bytes.
// This handles image-sharing sites (Pinterest, etc.) that block direct hotlinking.
async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; img2prompt/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Failed to fetch image (HTTP ${res.status})`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error(
      "That URL doesn't point to an image file. Please use a direct image URL (ending in .jpg, .png, etc.)."
    );
  }
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  return `data:${contentType.split(";")[0]};base64,${b64}`;
}

// Build the image value Groq expects (always resolves to a data URL or base64).
async function buildImageUrl(body: any): Promise<string | null> {
  if (body.imageBase64 && body.mediaType) {
    const clean = body.imageBase64.replace(/^data:.*?;base64,/, "");
    return `data:${body.mediaType};base64,${clean}`;
  }
  if (body.imageUrl && typeof body.imageUrl === "string") {
    const url = body.imageUrl.trim();
    if (url.startsWith("data:")) return url;
    return fetchAsDataUrl(url);
  }
  return null;
}

async function callGroq(groq: Groq, model: string, imageUrl: string) {
  return groq.chat.completions.create({
    model,
    max_tokens: 1024,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: USER_TEXT },
          { type: "image_url", image_url: { url: imageUrl } },
        ] as any,
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API key not set. Add GROQ_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const body = await req.json();
    let imageUrl: string | null;
    try {
      imageUrl = await buildImageUrl(body);
    } catch (fetchErr: any) {
      return NextResponse.json({ error: fetchErr.message }, { status: 400 });
    }
    if (!imageUrl) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    let completion;
    try {
      completion = await callGroq(groq, MODEL, imageUrl);
    } catch (primaryErr: any) {
      // If the primary model is unavailable, retry once with the fallback model.
      console.warn("Primary model failed, trying fallback:", primaryErr?.message);
      completion = await callGroq(groq, FALLBACK_MODEL, imageUrl);
    }

    const raw = completion.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ prompt: cleaned, details: null, suggested_tags: [] });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Analyze error:", err);
    const msg =
      err?.error?.message ||
      err?.message ||
      "Something went wrong analyzing the image.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
