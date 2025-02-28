import { ThreadMessage } from '@/types/chat'
import OpenAI from 'openai'
import { getSystemPrompt } from '../agent/system-prompt'
import { basicWorkflowsPrompt } from '../workflows/basic_workflows_prompt'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Add type for OpenAI chat roles
type ChatRole = 'system' | 'user' | 'assistant'

/**
 * ============= OPENAI CALL TO TRIAGE THE MESSAGE INTENT ================
 * This function returns one of the following responseTypes:
 *  - simpleResponse: Provide a simple response
 * =======================================================================
 */
export async function triageMessageIntent(threadMessages: ThreadMessage[]): Promise<{ 
  responseType: 
  "sendIdentityCard"|
  "simpleResponse"
}> {
  // Convert thread messages to OpenAI chat format
  const conversationContext: ChatCompletionMessageParam[] = threadMessages.map((msg) => ({
    role: msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" as const : "user" as const,
    content: msg.content,
  }));


  const triagePrompt = `
Based on the conversation, analyze the user's intent and respond with exactly one of these JSON responses:
{"responseType":"sendIdentityCard"}
{"responseType":"simpleResponse"}

Rules:
- If the user is requesting some sort of identification i.e 'who are you', select "sendIdentityCard"
- Otherwise, select "simpleResponse"

Return valid JSON with only that single key "responseType" and value as one of the two allowed strings.
`;

  // Get completion from OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: triagePrompt },
      ...conversationContext,
    ],
  });

  const content = completion.choices[0]?.message?.content || "";
  console.log(content)
  // Parse response and validate response type
  try {
    const parsed = JSON.parse(content);
    const validTypes = [
      "sendIdentityCard",
      "simpleResponse"
    ];

    if (validTypes.includes(parsed.responseType)) {
      return { responseType: parsed.responseType };
    }

    return { responseType: "simpleResponse" };
  } catch {
    // Default to simple response if parsing fails
    return { responseType: "simpleResponse" };
  }
}

/**
 * Generate an introduction message for the AI agent when first joining a conversation.
 * Uses the agent profile settings to craft a contextual introduction.
 */
export async function generateAgentIntroduction(userName: string, incomingMessage: string): Promise<string> {
  const conversation: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: getSystemPrompt(userName)
    },
    {
      role: "user",
      content: incomingMessage
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: conversation,
  });

  return completion.choices[0]?.message?.content || "Hello!";
}


/**
 * Generate a response to a WhatsApp thread of messages.
 * If userPrompt is provided, it will be passed as a user-level instruction in addition to the system prompt.
 */
export async function generateAgentResponse(threadMessages: ThreadMessage[], userPrompt?: string): Promise<string> {
  const messages: ChatCompletionMessageParam[] = threadMessages.map((msg) => ({
    role: (msg.sender_number === process.env.A1BASE_AGENT_NUMBER! ? "assistant" : "user") as ChatRole,
    content: msg.content,
  }));

  // Extract the latest user's name (not the agent)
  const userName = [...threadMessages]
    .reverse()
    .find((msg) => msg.sender_number !== process.env.A1BASE_AGENT_NUMBER!)?.sender_name;

  if (!userName) {
    return "Hey there!";
  }

  // Build the conversation to pass to OpenAI
  const conversation: ChatCompletionMessageParam[] = [
    { role: "system", content: getSystemPrompt(userName) }
  ];

  // If there's a user-level prompt from basicWorkflowsPrompt, add it as a user message
  if (userPrompt) {
    conversation.push({ role: "user", content: userPrompt });
  }

  // Then add the actual chat messages
  conversation.push(...messages);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: conversation,
  });

  const content = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response";

  // Try parsing as JSON to extract just the "message"
  try {
    const data = JSON.parse(content);
    return data.message || "No message found.";
  } catch (error) {
    // If not valid JSON, just return the entire text
    return content;
  }
}