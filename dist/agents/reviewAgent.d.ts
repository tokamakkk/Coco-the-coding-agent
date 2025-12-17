/**
 * Review Agent
 * Reviews and improves generated code
 */
export declare class ReviewAgent {
    private chain;
    private modificationChain;
    private analysisChain;
    constructor(apiKey: string, baseURL: string);
    /**
     * Analyze code and return review items
     * @param code - Code to analyze
     * @returns Array of review item descriptions
     */
    analyzeCode(code: string): Promise<string[]>;
    /**
     * Review and improve generated code
     * @param code - Generated code in markdown format
     * @returns Object containing review items and improved code
     */
    reviewCode(code: string): Promise<{
        reviewItems: string[];
        improvedCode: string;
    }>;
    /**
     * Review and modify code based on user's modification request
     * @param code - Current code in markdown format
     * @param modification - User's modification request
     * @returns Modified code in markdown format
     */
    reviewCodeWithModification(code: string, modification: string): Promise<string>;
}
//# sourceMappingURL=reviewAgent.d.ts.map