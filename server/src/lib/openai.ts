import OpenAI from "openai";
import { getEnvConfig } from "../env.js";

let cachedClient: OpenAI | null = null;

/**
 * Returns the shared OpenAI client instance for AISLE.
 *
 * @returns The configured OpenAI SDK client.
 * @throws Never.
 */
export function getOpenAiClient(): OpenAI {
  if (cachedClient !== null) {
    return cachedClient;
  }

  cachedClient = new OpenAI({
    apiKey: getEnvConfig().OPENAI_API_KEY
  });

  return cachedClient;
}

/**
 * Calls OpenAI and parses a strict JSON object response.
 *
 * @param input The system and user prompt strings to send.
 * @returns The parsed JSON object.
 * @throws {Error} Throws when the response is empty or malformed.
 */
export async function callOpenAiJson<T>(input: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<T> {
  const client = getOpenAiClient();
  const completion = await client.chat.completions.create({
    model: "codex-mini-latest",
    response_format: {
      type: "json_object"
    },
    messages: [
      {
        role: "system",
        content: input.systemPrompt
      },
      {
        role: "user",
        content: input.userPrompt
      }
    ]
  });
  const rawContent = completion.choices[0]?.message.content;

  if (rawContent === null || rawContent === undefined) {
    throw new Error("OpenAI returned an empty response.");
  }

  return JSON.parse(rawContent) as T;
}
