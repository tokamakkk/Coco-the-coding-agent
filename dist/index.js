import * as dotenv from "dotenv";
import * as readline from "readline";
import { Orchestrator } from "./orchestrator.js";
// Load environment variables
dotenv.config();
/**
 * Print startup banner with ASCII art logo
 */
function printStartupBanner() {
    console.log("\n");
    console.log("  ╔════════════════════════════════════════╗");
    console.log("  ║                                        ║");
    console.log("  ║        COCO(●'◡'●)                    ║");
    console.log("  ║                                        ║");
    console.log("  ╚════════════════════════════════════════╝");
    console.log("\n");
    console.log("  Hi! This is coco — your coding agent.\n");
    console.log("  I can break down your task, generate code, review it, and write a complete project to your local machine.");
    console.log("  You can also ask me to refine or improve the code after it's generated.\n");
    console.log("  What can I help you build today?\n");
}
/**
 * Helper function to prompt user for input
 */
function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
/**
 * Main entry point for the terminal-based coding agent
 */
async function main() {
    // Display startup banner
    printStartupBanner();
    // Validate environment variables
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
    if (!apiKey) {
        console.error("❌ Error: DEEPSEEK_API_KEY is not set in .env file");
        console.error("Please create a .env file with your DeepSeek API key");
        process.exit(1);
    }
    // Initialize orchestrator
    const orchestrator = new Orchestrator(apiKey, baseURL);
    // Set up terminal input interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    // Code memory - stores the current version of the code
    let currentCode = null;
    let isInitialTask = true;
    try {
        // Initial task input
        const initialTask = await askQuestion(rl, "Enter your coding task: ");
        if (!initialTask.trim()) {
            console.error("❌ Error: Task cannot be empty");
            rl.close();
            process.exit(1);
        }
        // Execute initial pipeline (task decomposition → code generation → review)
        const initialCode = await orchestrator.executeInitial(initialTask.trim());
        // Store the initial code
        currentCode = initialCode;
        // Mark that initial task is complete
        isInitialTask = false;
        // Persistent interaction loop
        while (true) {
            const userInput = await askQuestion(rl, "Do you want to modify or improve the code? (Describe changes or type 'exit'/'quit'): ");
            const trimmedInput = userInput.trim().toLowerCase();
            // Check for exit commands
            if (trimmedInput === "exit" || trimmedInput === "quit") {
                console.log("\n👋 Exiting. Goodbye!");
                break;
            }
            // Skip empty inputs
            if (!trimmedInput) {
                console.log("⚠️  Please provide a modification request or type 'exit' to quit.\n");
                continue;
            }
            // Ensure we have code to modify
            if (!currentCode) {
                console.error("❌ Error: No code available to modify");
                continue;
            }
            try {
                // Process modification request using only the review agent
                console.log("\n" + "-".repeat(60));
                console.log(`ITERATION: Processing modification request`);
                console.log("-".repeat(60) + "\n");
                const improvedCode = await orchestrator.improveCode(currentCode, trimmedInput);
                // Update code memory
                currentCode = improvedCode;
                // Output updated code
                console.log("\n" + "=".repeat(60));
                console.log("UPDATED CODE:");
                console.log("=".repeat(60));
                console.log(currentCode);
                console.log("=".repeat(60) + "\n");
            }
            catch (error) {
                console.error("❌ Error during code modification:", error instanceof Error ? error.message : String(error));
                console.log("Please try again or type 'exit' to quit.\n");
            }
        }
    }
    catch (error) {
        console.error("❌ Error during execution:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
    finally {
        rl.close();
    }
}
// Run the application
main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map