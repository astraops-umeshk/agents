import { AIMessage, SystemMessage, HumanMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";



//utlity to handle conversational messages, that are not in conversational format
export function MessageStacker(messages: string[]){
    const stackedMessages = [];
    for (let i = 0; i < messages.length; i++) {
        if (i % 2 === 0) {
            const human = new HumanMessage(messages[i]);
            stackedMessages.push(human);
        } else {
            stackedMessages.push(new AIMessage(messages[i]));
        }
    }
    return stackedMessages;
}

//utlity to set system prompt
export function SetSystemInstruction(instruction:string,messages?: any){
    const systemMessage = new SystemMessage(instruction);
    if (messages){
        return [systemMessage, ...messages];
    }
       return [systemMessage];
}

//utility to set user's current request as part of the prompt/message to pass to LLM 
export function SetUserPrompt(prompt:string,messages?: any){
    const userMessage = new HumanMessage(prompt);
    if (messages){
        return [...messages, userMessage];
    }
    return [userMessage];
}



