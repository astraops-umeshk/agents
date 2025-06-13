import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage,HumanMessage,ToolMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage } from "@langchain/core/messages";
import { RunnableLike } from "@langchain/core/runnables";

// Assuming the LLM class remains the same
class LLM {
  private model: BaseChatModel;
  private instructions: BaseMessage[];

  constructor(model: BaseChatModel) {
    this.model = model;
    this.instructions = [];
  }

  initialize(instructions: BaseMessage[]) {
    this.instructions = instructions;
  }

  showAndTell() {
    console.log(this.model.constructor.name);
  }
}

// Define the interface for the Agent
interface Agent {
  run(userPrompt: string): RunnableLike<any>; // Assuming the agent returns a RunnableLike object
  appendUserMessage(userPrompt: string): void; // Added method to append user message
}

// Define the ChatAgent implementation
class ChatAgent implements Agent {
  private llm: BaseChatModel;
  private promptInstruction: string;
  private instructions: BaseMessage[]; // Store instructions within the agent

  constructor(llm: BaseChatModel, promptInstruction: string) {
    this.llm = llm;
    this.promptInstruction = promptInstruction;
    this.instructions = []; // Initialize instructions
  }

  appendUserMessage(userPrompt: string): void {
    const userMessage = new HumanMessage({ content: userPrompt });
    this.instructions.push(userMessage);
  }

  run(userPrompt: string): RunnableLike<any> {
    // Create a ReAct Agent without tools
    const agent = createReactAgent({
      llm: this.llm,
      tools: [], // Explicitly pass an empty array for no tools
    });

    return agent;
  }
}

// Define the Factory interface
interface AgentFactory {
  createAgent(llm: BaseChatModel, promptInstruction?: string): Agent;
}

// Define the ChatAgentFactory implementation
class ChatAgentFactory implements AgentFactory {
  createAgent(llm: BaseChatModel, promptInstruction?: string): Agent {
    return new ChatAgent(llm, promptInstruction || "you are a helpful assistant");
  }
}

export { ChatAgentFactory, Agent, LLM };