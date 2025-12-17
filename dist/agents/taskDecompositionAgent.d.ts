/**
 * Task Decomposition Agent
 * Breaks down natural language tasks into structured, executable steps
 */
export declare class TaskDecompositionAgent {
    private chain;
    constructor(apiKey: string, baseURL: string);
    /**
     * Decompose a task into structured steps
     * @param task - Natural language task description
     * @returns JSON string with steps array
     */
    decompose(task: string): Promise<string>;
}
//# sourceMappingURL=taskDecompositionAgent.d.ts.map