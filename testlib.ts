import {SetSystemInstruction,SetUserPrompt,MessageStacker} from  "./utils.ts";
// import  "./AgentBuilder.ts";
// import AgentBuilder from "./AgentBuilder";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {marked} from 'marked';
import {markedTerminal} from 'marked-terminal';
import {z} from "zod";


// 
marked.use(markedTerminal());

//init llm 
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  apiKey: "AIzaSyCJAbF_jL9r7UrSnt6KbxfPh7WeJSXkVYA",
//   verbose: true
});

// ===== Architect ======

let architectSystemInstruction = `
Assume Defaults (Ask Only Critical Questions):

    Only clarify if:

        Cloud provider is unspecified (AWS/Azure/GCP).

        Core purpose is unclear (e.g., "host a website" vs. "process data pipelines").

        Scale is ambiguous (e.g., "high-traffic" without numbers).

    Otherwise, assume:

        Mid-scale workloads (e.g., 1k-10k users).

        General-purpose compliance (ISO-27001).

        Budget-friendly tiering.

Output Structure:
Always return:
markdown

    ### Resource Categories  
    - **Compute**: [Type] (e.g., 'Serverless Functions', 'Kubernetes Cluster', 'VM Pool')  
    - **Storage**: [Type] (e.g., 'Object Storage', 'NoSQL Database', 'File System')  
    - **Networking**: [Type] (e.g., 'Load Balancer', 'VPC', 'CDN')  
    - **Special Services**: [Optional: e.g., 'Message Queue', 'Cache']  
    **Provider-Specific Examples**:  
    - 'AWS': Lambda, S3, ALB  
    - 'Azure': Functions, Blob Storage, Application Gateway  
    - 'GCP': Cloud Run, Cloud Storage, Cloud Load Balancing  

    Key Principles:

        Keep it generic: Recommend types of resources (e.g., "Object Storage") over specific products (e.g., "S3").

        Serverless-first: Default to serverless/containers unless VMs are explicitly needed.

        Ignore: Compliance details, cost calculations, and granular security configurations.

Example Workflow

User Query:

    "Host a static website with user uploads."

Agent Response:
markdown

### Resource Categories  
- **Compute**: Static Hosting (No compute needed)  
- **Storage**: Object Storage (for website files + user uploads)  
- **Networking**: CDN + Global Load Balancer  
- **Special Services**: -  
**Provider-Specific Examples**:  
- 'AWS': CloudFront + S3  
- 'Azure': CDN + Blob Storage  
- 'GCP': Cloud CDN + Cloud Storage  
`

// let architectUserPrompt = `
// I want to make a Web App that does insurance Document management. 
// I expect this to be deployed on the customer's premises and 
// should be easily capable of handling a hundred users concurrently. 
// should be easily capable of handling a hundred users concurrently.
// `
// Read user input for the architect user prompt

const architectUserPrompt = await (async () => {
    const { default: inquirer } = await import('inquirer');
    const response = await inquirer.prompt([{
        type: 'input',
        name: 'userPrompt',
        message: 'Please describe your cloud infrastructure requirements:'
    }]);
    return response.userPrompt;
})();



const architectPrompt = SetUserPrompt(
    architectUserPrompt,
    SetSystemInstruction(architectSystemInstruction)
);

let architectResult = await  model.invoke(architectPrompt);

// checking what the type of the Result Object is after invocation.
console.log(architectResult.constructor.name);

console.log(marked(getContentAsString(architectResult.content)));

// ===== Interim Structure =====

let InterimSystemPrompt = `You are a Cloud Resource Mapper. Convert the architectural description into a provider-agnostic JSON structure with hierarchical dependencies. Include ONLY:

### Output Format (JSON only)
{
  "architecture_summary": "string",
  "resources": [
    {
      "logical_name": "string",
      "type": "generic_service_type",
      "dependencies": ["logical_name"],
      "scalability": "low|medium|high"
    }
  ],
  "constraints": {
    "budget": "string",
    "compliance": ["string"]
  }
}

### Mapping Rules
- Map components → resources[] entries
- Convert relationships → dependencies[]
- Preserve scalability ratings
- Use generic types: 
  "Compute", "Database", "Storage", "Queue", "API", "Cache"

### Example Input (from Architect):
**Description**: Serverless API with data processing...
**Components**:
- API Gateway: Handles HTTP requests (Scalability: high)
- Data Processor: Transforms data (Scalability: medium)
- Object Storage: Stores files (Scalability: high)
**Relationships**:
- API Gateway → Data Processor
- Data Processor → Object Storage

### Example Output:
{
  "architecture_summary": "Serverless API with data processing pipeline",
  "resources": [
    {
      "logical_name": "API Gateway",
      "type": "API",
      "dependencies": ["Data Processor"],
      "scalability": "high"
    },
    {
      "logical_name": "Data Processor",
      "type": "Compute",
      "dependencies": ["Object Storage"],
      "scalability": "medium"
    },
    {
      "logical_name": "Object Storage",
      "type": "Storage",
      "dependencies": [],
      "scalability": "high"
    }
  ],
  "constraints": {
    "budget": "<$500/month",
    "compliance": ["SOC 2"]
  }
}`

let interimPrompt = SetSystemInstruction(
    InterimSystemPrompt,
    [architectResult] /*wrapping in an Array because this function requires me to spread this later on*/);

let interimResult = await model.invoke(interimPrompt);

// console.log("second invocation done")

console.log(marked(getContentAsString(interimResult.content)));

// ===== Resource Suggester =====




// --- pointless-nice-to-haves ---

function getContentAsString(content): string {
    if (typeof content === 'string') {
        return content;
    } else if (Array.isArray(content)) {
        // Filter for text parts and join them
        return content
            .filter(part => typeof part === 'object' && 'text' in part && typeof part.text === 'string')
            .map(part => (part as { text: string }).text)
            .join('');
    }
    return ''; // Fallback for unexpected content types
}
