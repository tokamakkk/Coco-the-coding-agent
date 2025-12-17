import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
/**
 * Task Decomposition Agent
 * Breaks down natural language tasks into structured, executable steps
 */
export class TaskDecompositionAgent {
    chain;
    constructor(apiKey, baseURL) {
        // Initialize DeepSeek via OpenAI-compatible interface
        const llm = new ChatOpenAI({
            modelName: "deepseek-v3.2",
            openAIApiKey: apiKey,
            configuration: {
                baseURL: baseURL,
            },
            temperature: 0.3, // Lower temperature for more structured output
        });
        // Define prompt template for task decomposition
        const prompt = PromptTemplate.fromTemplate(`
You are a task decomposition agent. Your job is to break down a coding task into concrete, executable steps.

User Task: {task}

Analyze the task and break it down into an ordered list of specific, actionable steps.
Output ONLY a valid JSON object with this exact structure:
{{
  "steps": [
    "Step 1 description",
    "Step 2 description",
    ...
  ]
}}

Do not include any explanations, comments, or markdown formatting. Output only the JSON object.
`);
        this.chain = new LLMChain({
            llm: llm,
            prompt: prompt,
        });
    }
    /**
     * Decompose a task into structured steps
     * @param task - Natural language task description
     * @returns JSON string with steps array
     */
    async decompose(task) {
        try {
            const result = await this.chain.invoke({ task });
            // Extract JSON from response (handle potential markdown code blocks)
            let jsonString = result.text.trim();
            // Remove markdown code blocks if present
            if (jsonString.startsWith("```json")) {
                jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            }
            else if (jsonString.startsWith("```")) {
                jsonString = jsonString.replace(/```\n?/g, "");
            }
            // Validate JSON structure
            const parsed = JSON.parse(jsonString);
            if (!parsed.steps || !Array.isArray(parsed.steps)) {
                throw new Error("Invalid JSON structure: missing 'steps' array");
            }
            return jsonString;
        }
        catch (error) {
            throw new Error(`Task decomposition failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=taskDecompositionAgent.js.map