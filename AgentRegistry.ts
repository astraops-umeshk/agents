import {z} from "zod";
import {  BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";

// WARNING!!cl  DOES NOT WORK. 


// Framework Core
interface AgentConfig {
  llmName: string;
  tools: string[];
}

interface ModelConfig {
  model: string;
  apiKey: string;
  maxOutputTokens?: number;
}

interface ToolConfig {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: (args: any) => Promise<any>;
}

class 
AgentRegistry {
  private static models: Record<string, any> = {};
  private static tools: Record<string, any> = {};
  private static agents: Record<string, AgentConfig> = {};



  static registerTool(toolConfig: ToolConfig) {2
    this.tools[toolConfig.name] = tool(toolConfig.handler, {
      name: toolConfig.name,
      description: toolConfig.description,
      schema: toolConfig.schema
    });
  }

  static registerAgent(name: string, config: AgentConfig) {
    this.agents[name] = config;
  }

  static getAgent(name: string) {
    const config = this.agents[name];
    return createReactAgent({
      llm: this.models[config.modelName],
      tools: config.tools.map(t => this.tools[t])
    });
  }
}

// Usage Example
async function main() {
  // Register Components
  AgentRegistry.registerModel('google-flash', {
    model: 'gemini-2.0-flash',
    apiKey: 'AIzaSyCJAbF_jL9r7UrSnt6KbxfPh7WeJSXkVYA',
    maxOutputTokens: 2048
  });

  AgentRegistry.registerTool({
    name: 'search',
    description: 'Call to surf the web.',
    schema: z.object({
      query: z.string().describe("The query to use in your search."),
    }),
    handler: async ({ query }) => {
      if (query.toLowerCase().match(/sf|san francisco/)) {
        return "It's 60 degrees and foggy.";
      }
      return "It's 90 degrees and sunny.";
    }
  });


  AgentRegistry.registerAgent('weather-agent', {
    modelName: 'google-flash',
    tools: ['search']
  });


  // Create and use agent
  const agent = AgentRegistry.getAgent('weather-agent');
  const result = await agent.invoke({
    messages: [{
      role: "user",
      content: "what is the weather in sf"
    }]
  });

  console.log(result.messages);
}

main();