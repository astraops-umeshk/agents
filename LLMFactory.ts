import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; 
import { ChatAnthropic } from "@langchain/anthropic";
import { tool,Tool } from "@langchain/core/tools";

interface LLMFactoryConfig {
  llmType: string;
  modelName?: string;
  promptTemplate: ChatPromptTemplate; 
  llmConfig?: Record<string, any>; // Record is the Standin for Dicts in Python
}

async function LLMFactory({ llmType, modelName, promptTemplate, llmConfig = {} }: LLMFactoryConfig) {
  let llm: BaseChatModel; // I had to look very hard for this one. 

  // covering all the three. using a switch case. Something I haven't done in a very long time. 
  switch (llmType.toLowerCase()) {
    case 'openai':
      llm = new ChatOpenAI({ model: modelName || "gpt-4.1-mini", ...llmConfig });
      break;
    case 'gemini': 
      llm = new ChatGoogleGenerativeAI({ model: modelName || "gemini-2.0-flash", ...llmConfig });
      break;
    case 'anthropic':
      llm = new ChatAnthropic({model: modelName || "claude-3-5-haiku-latest", ...llmConfig});
      break;
    // TODO:
    // case 'groq': 
    // TODO: 
    // case 'ollama':
    default:
      throw new Error(`Unsupported LLM type: ${llmType}, ${llmType} is yet to be supported or doesn't exist at all. \n\n Check again please`);
  }

  

  // Having a runnable here is the solution to coupling the llm with the instruction without actually executing the call 
  // No more dangling Messages. That said. 
  // TODO: Message Builder is required. 
  const runnable = promptTemplate.pipe(llm);

  return runnable; // Return the runnable chain
}

// No classes just a function. That is the elegance of using the pre existing code. 
export { LLMFactory };