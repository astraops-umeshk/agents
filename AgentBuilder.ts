import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessage } from "@langchain/core/messages";

class LLM{ 
  private model:BaseChatModel;
  private instructions: BaseMessage[]; 

  constructor(model: BaseChatModel){
    this.model = model;
    this.instructions = [];
  }

  initialize(instructions: BaseMessage[]){

  }

  showAndTell(){
      console.log(this.model.constructor.name);

  }
  
}

/**
 * A builder class for constructing Agent instances.
 * Allows for fluent, step-by-step configuration of an Agent.
 */
class AgentBuilder {
  private llm: any;
  private promptInstruction: string; // Initialize with a default or enforce through build()
  private tools?: any[];

  /**
   * Sets the Large Language Model (LLM) for the agent.
   * @param llm The LLM instance.
   * @returns The AgentBuilder instance for chaining.
   */
  withLLMas(llm: any): AgentBuilder {
    this.llm = llm;
    return this; // Important for method chaining
  }

  /**
   * Sets the primary prompt instruction for the agent.
   * @param instruction The prompt instruction string.
   * @returns The AgentBuilder instance for chaining.
   */
  withPromptInstruction(instruction?: string): AgentBuilder {
    this.promptInstruction = instruction || "you are a helpful assistant";
    return this;
  }

  /**
   * Sets an array of tools available to the agent.
   * @param tools An array of tool instances.
   * @returns The AgentBuilder instance for chaining.
   */
  withTools(tools: any[]): AgentBuilder {
    this.tools = tools;
    return this;
  }

  /**
   * Constructs and returns the final Agent instance.
   * Performs validation to ensure all required components are set.
   * @returns A new Agent instance.
   * @throws Error if required properties (LLM, promptInstruction) are not set.
   */
  build()  {
    // instance a ReAct Agent in Langchain and send it out.
   const agent = createReactAgent({
    llm: this.llm,
    tools: this.tools ?? [],
   });
    return agent
  }
}

export default AgentBuilder;