import { TaskDecompositionAgent } from "./agents/taskDecompositionAgent.js";
import { CodingAgent } from "./agents/codingAgent.js";
import { ReviewAgent } from "./agents/reviewAgent.js";
import { FileManager } from "./utils/fileManager.js";
import * as path from "path";

/**
 * Central Orchestrator
 * Controls the execution flow of the multi-agent system
 */
export class Orchestrator {
  private taskAgent: TaskDecompositionAgent;
  private codingAgent: CodingAgent;
  private reviewAgent: ReviewAgent;
  private fileManager: FileManager;

  constructor(apiKey: string, baseURL: string, basePath?: string) {
    // Initialize all agents
    this.taskAgent = new TaskDecompositionAgent(apiKey, baseURL);
    this.codingAgent = new CodingAgent(apiKey, baseURL);
    this.reviewAgent = new ReviewAgent(apiKey, baseURL);
    this.fileManager = new FileManager(basePath);
  }

  /**
   * Execute the full initial agent pipeline (used only once)
   * @param userTask - Natural language task from user
   * @returns Initial generated and reviewed code
   */
  async executeInitial(userTask: string): Promise<string> {
    console.log("🤖 Starting initial multi-agent pipeline...\n");
    
    // Step 1: Task Decomposition
    console.log("📋 Step 1/4: Decomposing task into steps...");
    const stepsJson = await this.taskAgent.decompose(userTask);
    console.log("✅ Task decomposed successfully\n");
    
    // Display task decomposition result
    try {
      const parsed = JSON.parse(stepsJson);
      if (parsed.steps && Array.isArray(parsed.steps)) {
        console.log("Task Decomposition Result:");
        parsed.steps.forEach((step: string, index: number) => {
          console.log(`${index + 1}. ${step}`);
        });
        console.log(""); // Empty line for readability
      }
    } catch (error) {
      // If parsing fails, just continue (shouldn't happen as decompose validates JSON)
      console.log("⚠️  Could not display decomposition result\n");
    }
    
    // Step 2: Code Generation
    console.log("💻 Step 2/4: Generating code...");
    const generatedCode = await this.codingAgent.generateCode(userTask, stepsJson);
    
    // Step 3: Code Review
    console.log("🔍 Step 3/4: Reviewing and improving code...");
    
    const reviewResult = await this.reviewAgent.reviewCode(generatedCode);
    
    console.log("✅ code review successfully\n");
    
    // Step 4: Write files to disk
    console.log("📁 Step 4/4: Writing files to disk...\n");
    try {
      const writeResult = await this.fileManager.writeFiles(userTask, reviewResult.improvedCode);
      
      // Generate directory tree from filesystem
      const tree = await this.fileManager.generateDirectoryTreeFromFilesystem(writeResult.folderPath);
      
      // Get absolute path
      const absPath = path.resolve(writeResult.folderPath);
      
      // Generate run instructions
      const runInstructions = await this.fileManager.generateRunInstructions(writeResult.folderPath);
      
      // Output final information
      console.log("✅ code generation successfully\n");
      console.log(`Project path: ${absPath}\n`);
      console.log("Project structure:\n");
      console.log(tree);
      console.log("\nHow to run:\n");
      runInstructions.forEach(instruction => {
        console.log(instruction);
      });
      console.log("");
      
    } catch (error) {
      console.error("⚠️  Warning: Failed to write files:", error instanceof Error ? error.message : String(error));
      console.log("Code output is still available above.\n");
    }
    
    return reviewResult.improvedCode;
  }

  /**
   * Improve existing code based on modification request (used for iterations)
   * @param currentCode - Current version of the code
   * @param modificationRequest - User's modification request
   * @returns Improved code
   */
  async improveCode(currentCode: string, modificationRequest: string): Promise<string> {
    console.log("🔄 Processing modification request...\n");
    
    const improvedCode = await this.reviewAgent.reviewCodeWithModification(
      currentCode,
      modificationRequest
    );
    
    console.log("✅ Code updated successfully\n");
    
    return improvedCode;
  }
}

