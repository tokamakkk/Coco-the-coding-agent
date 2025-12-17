/**
 * Coding Agent
 * Generates code based on the original task and decomposed steps
 */
export declare class CodingAgent {
    private chain;
    constructor(apiKey: string, baseURL: string);
    /**
     * Generate code based on task and steps
     * @param task - Original natural language task
     * @param steps - JSON string with decomposed steps
     * @returns Generated code in markdown format
     */
    generateCode(task: string, steps: string): Promise<string>;
}
//# sourceMappingURL=codingAgent.d.ts.map