import OpenAI from "openai"
import type { GeneratedContent, Platform } from "@/types"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const file = new File([audioBuffer], filename, { type: "audio/mp4" })
  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "text",
  })
  return response
}

export async function generatePlatformContent(
  transcript: string,
  videoTitle: string,
  niche: string,
  tone: string,
): Promise<GeneratedContent[]> {
  const systemPrompt = `You are a social media content expert specializing in short-form video content.
Generate platform-optimized content for a video. Return ONLY valid JSON, no preamble or explanation.`

  const userPrompt = `Video Title: "${videoTitle}"
Niche: ${niche}
Tone: ${tone}
Transcript: "${transcript.slice(0, 3000)}"

Generate content for all 5 platforms. Return a JSON array with this exact structure:
[
  {
    "platform": "YOUTUBE",
    "title": "engaging title max 100 chars",
    "caption": "description with CTA",
    "hashtags": ["tag1", "tag2"],
    "description": "longer description for YouTube"
  },
  {
    "platform": "INSTAGRAM",
    "title": null,
    "caption": "engaging caption with emojis and story max 2200 chars",
    "hashtags": ["tag1", "tag2", "up to 30 tags"],
    "description": null
  },
  {
    "platform": "TIKTOK",
    "title": null,
    "caption": "short punchy caption with hook max 2200 chars",
    "hashtags": ["tag1", "tag2", "trending tags max 10"],
    "description": null
  },
  {
    "platform": "FACEBOOK",
    "title": null,
    "caption": "community-focused post text",
    "hashtags": ["tag1", "tag2", "tag3"],
    "description": null
  },
  {
    "platform": "TWITTER",
    "title": null,
    "caption": "punchy tweet max 280 chars",
    "hashtags": ["tag1", "tag2"],
    "description": null
  }
]`

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const text = response.choices[0].message.content ?? "[]"
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : (parsed.content ?? [])
  } catch {
    throw new Error("AI returned invalid JSON")
  }
}

export async function regeneratePlatformContent(
  transcript: string,
  videoTitle: string,
  niche: string,
  tone: string,
  platform: Platform,
): Promise<GeneratedContent> {
  const all = await generatePlatformContent(transcript, videoTitle, niche, tone)
  return all.find(c => c.platform === platform) ?? all[0]
}
