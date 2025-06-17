import { AIMessage, HumanMessage,ToolMessage, } from "@langchain/core/messages"


type AgentState= {
    message : AIMessage, // last message Response from AI. this key, the key below and the messages will all be the same for the start
    last_request : HumanMessage, // Last message from Human. 
    messages: Array<AIMessage | HumanMessage | ToolMessage>
    // intermediate_steps:     // We might need intermediate artifact steps here. 
    number_of_steps: number;
    errors_encountered?: string;
    routing_decision?: string;
}