/**
 * Workflow functions for handling WhatsApp messages and coordinating responses 
 * through the A1Base API.
 * 
 * Key workflow functions:
 * - verifyAgentIdentity: Sends identity verification message
 * - DefaultReplyToMessage: Generates and sends simple response  
 * 
 * Uses OpenAI for generating contextual responses.
 * Handles both individual and group message threads.
 */

import { A1BaseAPI } from "a1base-node";
import { 
  triageMessageIntent,
  generateAgentResponse, 
  generateAgentIntroduction,
} from "../services/openai";
import { ThreadMessage } from "@/types/chat";
import { basicWorkflowsPrompt } from "./basic_workflows_prompt";

// Configuration
const SPLIT_PARAGRAPHS = false; // Set to false to send messages without splitting

// Initialize A1Base client
const client = new A1BaseAPI({
  credentials: {
    apiKey: process.env.A1BASE_API_KEY!,
    apiSecret: process.env.A1BASE_API_SECRET!,
  }
});

// ====== BASIC SEND AND VERIFICATION WORKFLOW =======
// Functions for sending messages and verifying agent identity
// - verifyAgentIdentity: Sends identity verification message
// - DefaultReplyToMessage: Generates and sends simple response
// ===================================================

export async function verifyAgentIdentity(
  message: string,
  thread_type: "individual" | "group",
  thread_id?: string,
  sender_number?: string
) {
  console.log("Workflow Start [verifyAgentIdentity]");

  const agentIdCard = 'https://www.a1base.com/identity-and-trust/cd70954a-ab48-4d4d-af90-4d6ab5084bef'

  try {
    // Generate response message for identity verification
    const response = await generateAgentIntroduction("User", message);
    const messages = SPLIT_PARAGRAPHS ? response.split('\n').filter(msg => msg.trim()) : [response];
    
    // Send each message part
    for (const msg of messages) {
      if (thread_type === "individual" && sender_number) {
        await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
          content: msg,
          from: process.env.A1BASE_AGENT_NUMBER!,
          to: sender_number,
          service: "whatsapp",
        });
      } else if (thread_type === "group" && thread_id) {
        await client.sendGroupMessage(process.env.A1BASE_ACCOUNT_ID!, {
          content: msg,
          from: process.env.A1BASE_AGENT_NUMBER!,
          thread_id,
          service: "whatsapp",
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error in verifyAgentIdentity:", error);
    return false;
  }
}

export async function DefaultReplyToMessage(
  threadMessages: ThreadMessage[],
  thread_type: "individual" | "group",
  thread_id?: string,
  sender_number?: string
) {
  console.log("Workflow Start [DefaultReplyToMessage]");

  try {
    // Generate response using OpenAI
    const response = await generateAgentResponse(threadMessages, basicWorkflowsPrompt.simple_response.user);
    const messages = SPLIT_PARAGRAPHS ? response.split('\n').filter(msg => msg.trim()) : [response];

    // Send each message part
    for (const msg of messages) {
      if (thread_type === "individual" && sender_number) {
        await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
          content: msg,
          from: process.env.A1BASE_AGENT_NUMBER!,
          to: sender_number,
          service: "whatsapp",
        });
      } else if (thread_type === "group" && thread_id) {
        await client.sendGroupMessage(process.env.A1BASE_ACCOUNT_ID!, {
          content: msg,
          from: process.env.A1BASE_AGENT_NUMBER!,
          thread_id,
          service: "whatsapp",
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error in DefaultReplyToMessage:", error);
    return false;
  }
}

