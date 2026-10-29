import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null

function getClient() {
  if (!genAI && process.env.GOOGLE_AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  }
  return genAI
}

/**
 * Send a chat to Gemini, returns text or throws.
 * Falls back gracefully when no API key is configured.
 */
export async function geminiChat(systemPrompt, messages) {
  const client = getClient()
  if (!client) {
    return null // caller handles fallback
  }
  try {
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    })
    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const lastMessage = messages[messages.length - 1]
    const chat = model.startChat({ history })
    const result = await chat.sendMessage(lastMessage.content)
    return result.response.text()
  } catch (err) {
    console.error('[aiProvider] Gemini error:', err.message)
    return null
  }
}

/**
 * Single completion (no history) — useful for analysis tasks
 */
export async function geminiComplete(prompt) {
  const client = getClient()
  if (!client) return null
  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error('[aiProvider] Gemini complete error:', err.message)
    return null
  }
}

export const AI_AVAILABLE = () => Boolean(process.env.GOOGLE_AI_API_KEY)
