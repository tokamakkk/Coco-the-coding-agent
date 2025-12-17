import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

/**
 * Review Agent
 * Reviews and improves generated code
 */
export class ReviewAgent {
  private chain: LLMChain;
  private modificationChain: LLMChain;
  private analysisChain: LLMChain;

  constructor(apiKey: string, baseURL: string) {
    // Initialize DeepSeek via OpenAI-compatible interface
    const llm = new ChatOpenAI({
      modelName: "deepseek-v3.2",
      openAIApiKey: apiKey,
      configuration: {
        baseURL: baseURL,
      },
      temperature: 0.4, // Moderate temperature for balanced review
    });

    // Define prompt template for code review
    const prompt = PromptTemplate.fromTemplate(`
You are a code review agent. Your job is to review generated code and output an improved version.

Generated Code:
{code}

Review the code for:
- Correctness and completeness
- Best practices and code quality
- Potential bugs or issues
- Missing implementations

Output ONLY the improved code in the same format as the input (markdown code blocks).
Do not include explanations, comments, or any other text. Only output the improved code.
`);

    // Define prompt template for code modification
    const modificationPrompt = PromptTemplate.fromTemplate(`
You are a code modification agent. Your job is to modify existing code based on a user's request.

Current Code:
{code}

User's Modification Request:
{modification}

Apply the requested modifications to the code. Keep all parts of the code that are not mentioned in the modification request unchanged.
Output ONLY the modified code in the same format as the input (markdown code blocks).
Do not include explanations, comments, or any other text. Only output the modified code.
`);

    // Define prompt template for code analysis (review items)
    const analysisPrompt = PromptTemplate.fromTemplate(`
You are a code analysis agent. Your job is to analyze code and identify specific review items, fixes, and improvements.

Code to Review:
{code}

Analyze the code and identify specific review items. For each item, provide a brief description of what needs to be checked or fixed.
Output ONLY a valid JSON object with this exact structure:
{{
  "reviewItems": [
    "Brief description of review check or fix",
    "Another review item description",
    ...
  ]
}}

Do not include any explanations, comments, or markdown formatting. Output only the JSON object.
`);

    this.chain = new LLMChain({
      llm: llm,
      prompt: prompt,
    });

    this.modificationChain = new LLMChain({
      llm: llm,
      prompt: modificationPrompt,
    });

    this.analysisChain = new LLMChain({
      llm: llm,
      prompt: analysisPrompt,
    });
  }

  /**
   * Analyze code and return review items
   * @param code - Code to analyze
   * @returns Array of review item descriptions
   */
  async analyzeCode(code: string): Promise<string[]> {
    try {
      const result = await this.analysisChain.invoke({ code });
      let jsonString = result.text.trim();
      
      // Remove markdown code blocks if present
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/```\n?/g, "");
      }
      
      // Parse and validate JSON
      const parsed = JSON.parse(jsonString);
      if (!parsed.reviewItems || !Array.isArray(parsed.reviewItems)) {
        throw new Error("Invalid JSON structure: missing 'reviewItems' array");
      }
      
      return parsed.reviewItems;
    } catch (error) {
      throw new Error(`Code analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Review and improve generated code
   * @param code - Generated code in markdown format
   * @returns Object containing review items and improved code
   */
  async reviewCode(code: string): Promise<{ reviewItems: string[]; improvedCode: string }> {
    try {
      // First, analyze the code to get review items
      const reviewItems = await this.analyzeCode(code);
      
      // Then, generate the improved code
      const result = await this.chain.invoke({ code });
      const improvedCode = result.text.trim();
      
      return {
        reviewItems,
        improvedCode
      };
    } catch (error) {
      throw new Error(`Code review failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Review and modify code based on user's modification request
   * @param code - Current code in markdown format
   * @param modification - User's modification request
   * @returns Modified code in markdown format
   */
  async reviewCodeWithModification(code: string, modification: string): Promise<string> {
    try {
      const result = await this.modificationChain.invoke({ 
        code,
        modification 
      });
      return result.text.trim();
    } catch (error) {
      throw new Error(`Code modification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

