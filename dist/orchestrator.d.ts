/**
 * Central Orchestrator
 * Controls the execution flow of the multi-agent system
 */
export declare class Orchestrator {
    private taskAgent;
    private codingAgent;
    private reviewAgent;
    private fileManager;
    constructor(apiKey: string, baseURL: string, basePath?: string);
    /**
     * Execute the full initial agent pipeline (used only once)
     * @param userTask - Natural language task from user
     * @returns Initial generated and reviewed code
     */
    executeInitial(userTask: string): Promise<string>;
    /**
     * Improve existing code based on modification request (used for iterations)
     * @param currentCode - Current version of the code
     * @param modificationRequest - User's modification request
     * @returns Improved code
     */
    improveCode(currentCode: string, modificationRequest: string): Promise<string>;
}
//# sourceMappingURL=orchestrator.d.ts.map