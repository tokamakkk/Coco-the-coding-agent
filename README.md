# COCO - Coding Agent

A terminal-based multi-agent coding system using Node.js, TypeScript, and LangChain. COCO can break down your coding tasks, generate code, review it, and automatically write complete projects to your local machine.

## Overview

COCO is an intelligent coding assistant that:

1. **Breaks down tasks** into concrete, executable steps
2. **Generates code** based on the decomposed steps
3. **Reviews and improves** the generated code
4. **Writes files** to your local filesystem with proper directory structure
5. **Supports iterative refinement** - you can ask for modifications after initial generation

## Features

- 🤖 **Multi-Agent Architecture**: Three specialized agents working together
- 📝 **Task Decomposition**: Automatically breaks complex tasks into manageable steps
- 💻 **Code Generation**: Generates complete, working code
- 🔍 **Code Review**: Reviews and improves generated code
- 📁 **File Management**: Automatically creates project folders and writes files
- 🔄 **Iterative Improvement**: Modify and refine code through interactive dialogue
- 🌳 **Directory Tree Display**: Shows project structure after generation
- 📋 **Run Instructions**: Automatically generates instructions on how to run the project

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- DeepSeek API key (get one from https://platform.deepseek.com/)

## Installation

1. Clone or download this project

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

Replace `your_api_key_here` with your actual DeepSeek API key from https://platform.deepseek.com/

**Note**: You can also use other OpenAI-compatible APIs by changing the `DEEPSEEK_BASE_URL` (e.g., `https://dashscope.aliyuncs.com/compatible-mode/v1` for Alibaba Cloud).

## Usage

1. Build the TypeScript code:
```bash
npm run build
```

2. Run the application:
```bash
npm start
```

Or build and run in one command:
```bash
npm run dev
```

3. When the program starts, you'll see the COCO startup banner

4. Enter your coding task when prompted (e.g., "Create a todo list app with React")

5. The system will:
   - Decompose your task into steps
   - Generate code
   - Review and improve the code
   - Write files to a project folder
   - Display the project structure and run instructions

6. After code generation, you can:
   - Ask for modifications (e.g., "add error handling")
   - Request improvements (e.g., "optimize the performance")
   - Type `exit` or `quit` to end the session

## Example Workflow

```
Enter your coding task: Create a simple calculator app

🤖 Starting initial multi-agent pipeline...

📋 Step 1/4: Decomposing task into steps...
✅ Task decomposed successfully

Task Decomposition Result:
1. Create HTML structure with calculator interface
2. Add CSS styling for calculator buttons
3. Implement JavaScript calculation logic
4. Add event handlers for button clicks

💻 Step 2/4: Generating code...

🔍 Step 3/4: Reviewing and improving code...
✅ code review successfully

📁 Step 4/4: Writing files to disk...

✅ code generation successfully

Project path: D:\codingagent\Create_a_simple_calculator_app

Project structure:

Create_a_simple_calculator_app/
├── index.html
├── styles.css
└── app.js

How to run:

1. cd D:\codingagent\Create_a_simple_calculator_app
2. open index.html

Do you want to modify or improve the code? (Describe changes or type 'exit'/'quit'): 
```

## Project Structure

```
coding-agent-v2/
├── src/
│   ├── agents/
│   │   ├── taskDecompositionAgent.ts  # Breaks tasks into steps
│   │   ├── codingAgent.ts              # Generates code
│   │   └── reviewAgent.ts              # Reviews and improves code
│   ├── utils/
│   │   └── fileManager.ts              # Handles file operations
│   ├── orchestrator.ts                 # Coordinates agent workflow
│   └── index.ts                        # Main entry point
├── dist/                               # Compiled JavaScript (generated)
├── .env                                # Environment variables (create this)
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## Architecture

### Agents

1. **Task Decomposition Agent**
   - Input: Natural language task description
   - Output: Structured JSON with ordered steps
   - Purpose: Break down complex tasks into executable steps

2. **Coding Agent**
   - Input: Original task + decomposed steps
   - Output: Complete code in markdown format
   - Purpose: Generate working code based on requirements

3. **Review Agent**
   - Input: Generated code (or code + modification request)
   - Output: Improved/modified code
   - Purpose: Review, improve, and modify code

### Workflow

**Initial Generation:**
```
User Task → Task Decomposition → Code Generation → Code Review → File Writing
```

**Iterative Improvement:**
```
Modification Request → Code Review (with modification) → Updated Code
```

### File Management

- Automatically creates project folders based on task description
- Preserves directory structure for multi-file projects
- Generates directory tree visualization
- Provides run instructions based on project type
- Files are saved in the current working directory by default

## Configuration

### Environment Variables

- `DEEPSEEK_API_KEY`: Your DeepSeek API key (required)
- `DEEPSEEK_BASE_URL`: API endpoint URL (default: `https://api.deepseek.com/v1`)

### Model Configuration

The system uses **DeepSeek v3.2** model by default. You can modify the model name in the agent files if needed.

## Features in Detail

### Task Decomposition

The system displays the decomposed steps before code generation, allowing you to see how your task is being broken down.

### Code Review

The review agent automatically:
- Checks for correctness and completeness
- Applies best practices
- Identifies potential bugs
- Improves code quality

### File Writing

- Automatically parses code from markdown format
- Extracts file paths from code blocks or comments
- Creates necessary directory structure
- Handles file naming conflicts (adds timestamp if folder exists)

### Iterative Improvement

After initial code generation, you can:
- Request specific modifications
- Ask for improvements
- Refine existing features
- All changes are based on the current code version (not regenerated from scratch)

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure `.env` file exists in the project root
   - Verify `DEEPSEEK_API_KEY` is set correctly
   - Check that the API key is valid

2. **File Writing Errors**
   - Check file permissions in the target directory
   - Ensure sufficient disk space
   - Verify the path is accessible

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (requires 18+)
   - Verify TypeScript is properly configured

## Limitations

- Terminal-based only (no web UI)
- Code is not executed automatically
- Requires valid API key and internet connection
- File writing is limited to the local filesystem

## License

MIT

## Contributing

This is a personal coding agent project. Feel free to fork and modify for your own use.

## Acknowledgments

- Built with [LangChain](https://www.langchain.com/)
- Powered by [DeepSeek](https://www.deepseek.com/)
- Uses TypeScript and Node.js
