import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
/**
 * Coding Agent
 * Generates code based on the original task and decomposed steps
 */
export class CodingAgent {
    chain;
    constructor(apiKey, baseURL) {
        // Initialize DeepSeek via OpenAI-compatible interface
        const llm = new ChatOpenAI({
            modelName: "deepseek-v3.2",
            openAIApiKey: apiKey,
            configuration: {
                baseURL: baseURL,
            },
            temperature: 0.7, // Higher temperature for creative code generation
        });
        // Define prompt template for code generation
        const prompt = PromptTemplate.fromTemplate(`
You are a coding agent. Your job is to generate complete, working code based on a task and its decomposed steps.

Original Task: {task}

Decomposed Steps:
{steps}

Generate the complete code implementation. Output ONLY the code in markdown format (wrapped in code blocks with appropriate language tags).
Do not include explanations, comments outside the code, or any other text. Only output the code.
`);
        this.chain = new LLMChain({
            llm: llm,
            prompt: prompt,
        });
    }
    /**
     * Generate code based on task and steps
     * @param task - Original natural language task
     * @param steps - JSON string with decomposed steps
     * @returns Generated code in markdown format
     */
    async generateCode(task, steps) {
        try {
            const result = await this.chain.invoke({
                task,
                steps
            });
            return result.text.trim();
        }
        catch (error) {
            throw new Error(`Code generation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=codingAgent.js.map