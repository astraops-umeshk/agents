// // npm install @langchain-anthropic
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// // import { ChatAnthropic } from "@langchain/anthropic";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { tool } from "@langchain/core/tools";

// import { z } from "zod";

// const search = tool(async ({ query }) => {
//   if (query.toLowerCase().includes("sf") || query.toLowerCase().includes("san francisco")) {
//     return "It's 60 degrees and foggy."
//   }
//   return "It's 90 degrees and sunny."
// }, {
//   name: "search",
//   description: "Call to surf the web.",
//   schema: z.object({
//     query: z.string().describe("The query to use in your search."),
//   }),
// });

// // swapped the model for google 
// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash",
//   maxOutputTokens: 2048,
//   apiKey: "AIzaSyCJAbF_jL9r7UrSnt6KbxfPh7WeJSXkVYA",
// //   verbose: true
// });


// const agent = createReactAgent({
//   llm: model,
//   tools: [search],
// });

// //calling the tool and passing the input from the tool back into the agent i.e the LLM is done by the 
// const result = await agent.invoke(
//   {
//     messages: [{
//       role: "user",
//       content: "what is the weather in sf"
//     }]
//   }
// );

// console.log( result.messages);


import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LLMFactory } from "./LLMFactory.ts";
import * as dotenv from "dotenv";

// import { ChatMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// loading the .env
dotenv.config();

// prompt 
let instruction  = ChatPromptTemplate.fromMessages(["you are a helpful assistant","system"]); 

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

//debug
if (!GEMINI_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set.');
}

// testing the LLM Factory
const  llm = await  LLMFactory({
  llmType: "gemini",
  promptTemplate: instruction, 
  llmConfig: {
    apiKey: GEMINI_API_KEY 
  }
}); 


let res = await llm.invoke("Who are you? what are you doing here? "); 

console.log(res.content); 