import * as fs from "fs/promises";
import * as path from "path";
/**
 * File Manager Utility
 * Handles file creation, directory structure, and tree display
 */
export class FileManager {
    basePath;
    constructor(basePath = process.cwd()) {
        this.basePath = basePath;
    }
    /**
     * Sanitize folder name from task description
     * @param task - Task description
     * @returns Sanitized folder name
     */
    sanitizeFolderName(task) {
        // Remove special characters, keep alphanumeric, spaces, hyphens, underscores
        let sanitized = task
            .replace(/[^a-zA-Z0-9\s\-_]/g, "")
            .trim()
            .replace(/\s+/g, "_")
            .substring(0, 50); // Limit length
        // Ensure it's not empty
        if (!sanitized) {
            sanitized = "coding_task";
        }
        return sanitized;
    }
    /**
     * Parse code markdown to extract files
     * @param codeMarkdown - Code in markdown format with code blocks
     * @returns Array of file objects with path and content
     */
    parseCodeFiles(codeMarkdown) {
        const files = [];
        // Pattern to match markdown code blocks
        // Matches: ```language, ```language:path, ```path, or just ```
        const codeBlockPattern = /```(\w+)?(?::([^\n]+))?\n([\s\S]*?)```/g;
        let match;
        let blockIndex = 0;
        while ((match = codeBlockPattern.exec(codeMarkdown)) !== null) {
            const language = match[1]?.trim() || "";
            const explicitPath = match[2]?.trim() || "";
            const actualContent = match[3] || "";
            // Try to extract file path
            let filePath = "";
            // Priority 1: Explicit path in code block header
            if (explicitPath) {
                filePath = explicitPath;
            }
            // Priority 2: Check for file path in comments at the start of code
            else if (actualContent.trim()) {
                // Look for common comment patterns with file paths
                const commentPatterns = [
                    /^\/\/\s*File:\s*([^\n]+)/m,
                    /^#\s*File:\s*([^\n]+)/m,
                    /^<!--\s*File:\s*([^\n]+)\s*-->/m,
                    /\/\*\s*File:\s*([^*]+)\*\//m,
                ];
                for (const pattern of commentPatterns) {
                    const commentMatch = actualContent.match(pattern);
                    if (commentMatch && commentMatch[1]) {
                        filePath = commentMatch[1].trim();
                        break;
                    }
                }
            }
            // Priority 3: Use language to determine extension
            if (!filePath) {
                if (language) {
                    const ext = this.getExtensionFromLanguage(language);
                    // Generate filename based on language and index
                    if (blockIndex === 0) {
                        filePath = `main${ext}`;
                    }
                    else {
                        filePath = `file${blockIndex + 1}${ext}`;
                    }
                }
                else {
                    // No language specified, try to infer from content
                    const ext = this.inferExtensionFromContent(actualContent);
                    filePath = blockIndex === 0 ? `main${ext}` : `file${blockIndex + 1}${ext}`;
                }
            }
            // Ensure filePath doesn't start with / or ./
            filePath = filePath.replace(/^\.?\//, "");
            // Only add if we have content
            if (actualContent.trim()) {
                files.push({
                    filePath,
                    content: actualContent,
                });
                blockIndex++;
            }
        }
        // If no code blocks found, treat entire markdown as a single file
        if (files.length === 0 && codeMarkdown.trim()) {
            // Remove markdown headers and formatting, check if it's code
            const cleaned = codeMarkdown.replace(/^#+\s+/gm, "").trim();
            const plainCodePattern = /^[^#*`\[\]]/m;
            if (plainCodePattern.test(cleaned) || cleaned.includes("function") || cleaned.includes("class") || cleaned.includes("import")) {
                const ext = this.inferExtensionFromContent(cleaned);
                files.push({
                    filePath: `main${ext}`,
                    content: cleaned,
                });
            }
        }
        return files;
    }
    /**
     * Infer file extension from code content
     * @param content - Code content
     * @returns File extension with dot
     */
    inferExtensionFromContent(content) {
        // Check for language-specific patterns
        if (content.includes("<!DOCTYPE") || content.includes("<html"))
            return ".html";
        if (content.includes("@media") || content.includes("{")) {
            // Could be CSS, but check more carefully
            if (content.match(/[.#][\w-]+\s*{/))
                return ".css";
        }
        if (content.includes("import ") && content.includes("from "))
            return ".js";
        if (content.includes("require("))
            return ".js";
        if (content.includes("def ") || content.includes("import ")) {
            if (content.includes("print(") && !content.includes("console."))
                return ".py";
        }
        if (content.includes("package ") || content.includes("public class"))
            return ".java";
        if (content.includes("<?php"))
            return ".php";
        if (content.match(/^[\s]*<[\w]+/))
            return ".html";
        return ".js"; // Default to JavaScript
    }
    /**
     * Get file extension from language identifier
     * @param language - Language identifier (e.g., "javascript", "python")
     * @returns File extension with dot
     */
    getExtensionFromLanguage(language) {
        const languageMap = {
            javascript: ".js",
            js: ".js",
            typescript: ".ts",
            ts: ".ts",
            python: ".py",
            py: ".py",
            java: ".java",
            html: ".html",
            css: ".css",
            json: ".json",
            xml: ".xml",
            yaml: ".yaml",
            yml: ".yml",
            markdown: ".md",
            md: ".md",
            sql: ".sql",
            sh: ".sh",
            bash: ".sh",
            go: ".go",
            rust: ".rs",
            cpp: ".cpp",
            c: ".c",
            php: ".php",
            ruby: ".rb",
            swift: ".swift",
            kotlin: ".kt",
        };
        return languageMap[language.toLowerCase()] || ".txt";
    }
    /**
     * Create directory structure
     * @param dirPath - Directory path to create
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            if (error.code !== "EEXIST") {
                throw new Error(`Failed to create directory: ${dirPath} - ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    /**
     * Write files from parsed code
     * @param task - Task description (used for folder name)
     * @param codeMarkdown - Code in markdown format
     * @returns Created folder path and array of created file paths
     */
    async writeFiles(task, codeMarkdown) {
        // Parse files from markdown
        const parsedFiles = this.parseCodeFiles(codeMarkdown);
        if (parsedFiles.length === 0) {
            throw new Error("No files found in generated code");
        }
        // Create task folder
        const folderName = this.sanitizeFolderName(task);
        const folderPath = path.join(this.basePath, folderName);
        // Check if folder exists and handle it
        try {
            const stats = await fs.stat(folderPath);
            if (stats.isDirectory()) {
                // Folder exists, append timestamp to make it unique
                const timestamp = Date.now();
                const uniqueFolderName = `${folderName}_${timestamp}`;
                const newFolderPath = path.join(this.basePath, uniqueFolderName);
                await this.ensureDirectory(newFolderPath);
                console.log(`⚠️  Folder "${folderName}" already exists. Using "${uniqueFolderName}" instead.\n`);
                return await this.writeFilesToFolder(newFolderPath, parsedFiles);
            }
        }
        catch (error) {
            // Folder doesn't exist, create it
            await this.ensureDirectory(folderPath);
        }
        return await this.writeFilesToFolder(folderPath, parsedFiles);
    }
    /**
     * Write files to a specific folder
     * @param folderPath - Target folder path
     * @param files - Array of file objects
     * @returns Folder path and array of created file paths
     */
    async writeFilesToFolder(folderPath, files) {
        const createdFiles = [];
        for (const file of files) {
            const fullFilePath = path.join(folderPath, file.filePath);
            const fileDir = path.dirname(fullFilePath);
            // Ensure directory exists
            if (fileDir !== folderPath) {
                await this.ensureDirectory(fileDir);
            }
            // Write file
            try {
                await fs.writeFile(fullFilePath, file.content, "utf-8");
                createdFiles.push(file.filePath);
            }
            catch (error) {
                throw new Error(`Failed to write file ${file.filePath}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return {
            folderPath,
            files: createdFiles,
        };
    }
    /**
     * Generate directory tree structure from filesystem (recursive)
     * @param folderPath - Root folder path
     * @returns Directory tree string
     */
    async generateDirectoryTreeFromFilesystem(folderPath) {
        const folderName = path.basename(folderPath);
        const tree = [folderName + "/"];
        try {
            await this.buildTreeRecursive(folderPath, "", tree, true);
        }
        catch (error) {
            throw new Error(`Failed to generate directory tree: ${error instanceof Error ? error.message : String(error)}`);
        }
        return tree.join("\n");
    }
    /**
     * Recursively build directory tree structure
     * @param dirPath - Current directory path
     * @param prefix - Prefix for tree indentation
     * @param tree - Array to store tree lines
     * @param isRoot - Whether this is the root directory
     */
    async buildTreeRecursive(dirPath, prefix, tree, isRoot = false) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            // Sort entries: directories first, then files, both alphabetically
            const sortedEntries = entries.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory())
                    return -1;
                if (!a.isDirectory() && b.isDirectory())
                    return 1;
                return a.name.localeCompare(b.name);
            });
            for (let i = 0; i < sortedEntries.length; i++) {
                const entry = sortedEntries[i];
                const isLast = i === sortedEntries.length - 1;
                const connector = isLast ? "└──" : "├──";
                const currentPrefix = isRoot ? "" : prefix;
                if (entry.isDirectory()) {
                    tree.push(`${currentPrefix}${connector} ${entry.name}/`);
                    const nextPrefix = isRoot
                        ? (isLast ? "   " : "│  ")
                        : prefix + (isLast ? "   " : "│  ");
                    await this.buildTreeRecursive(path.join(dirPath, entry.name), nextPrefix, tree, false);
                }
                else {
                    tree.push(`${currentPrefix}${connector} ${entry.name}`);
                }
            }
        }
        catch (error) {
            // Silently skip directories that can't be read
            return;
        }
    }
    /**
     * Generate "How to run" instructions based on project files
     * @param folderPath - Project folder path
     * @returns Array of instruction strings
     */
    async generateRunInstructions(folderPath) {
        const instructions = [];
        const absPath = path.resolve(folderPath);
        try {
            const entries = await fs.readdir(folderPath, { withFileTypes: true });
            const files = entries.filter(e => e.isFile()).map(e => e.name);
            // Check for common entry points
            if (files.includes("package.json")) {
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. npm install`);
                instructions.push(`3. npm start`);
            }
            else if (files.includes("requirements.txt")) {
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. pip install -r requirements.txt`);
                instructions.push(`3. python main.py`);
            }
            else if (files.includes("index.html")) {
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. open index.html`);
            }
            else if (files.includes("main.py")) {
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. python main.py`);
            }
            else if (files.includes("main.js") || files.includes("index.js")) {
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. node ${files.includes("main.js") ? "main.js" : "index.js"}`);
            }
            else if (files.some(f => f.endsWith(".html"))) {
                const htmlFile = files.find(f => f.endsWith(".html"));
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. open ${htmlFile}`);
            }
            else {
                instructions.push(`1. cd ${absPath}`);
                instructions.push(`2. Check the project files and run the appropriate command`);
            }
        }
        catch (error) {
            instructions.push(`1. cd ${absPath}`);
            instructions.push(`2. Review the project files to determine how to run`);
        }
        return instructions;
    }
    /**
     * Generate directory tree structure (legacy method, kept for compatibility)
     * @param folderPath - Root folder path
     * @param files - Array of relative file paths
     * @returns Directory tree string
     */
    generateDirectoryTree(folderPath, files) {
        const folderName = path.basename(folderPath);
        const tree = [folderName + "/"];
        // Sort files to maintain consistent order
        const sortedFiles = [...files].sort();
        // Group files by directory
        const dirMap = new Map();
        for (const file of sortedFiles) {
            const dir = path.dirname(file);
            if (dir === ".") {
                // Root level file
                if (!dirMap.has(".")) {
                    dirMap.set(".", []);
                }
                dirMap.get(".").push(path.basename(file));
            }
            else {
                // File in subdirectory
                if (!dirMap.has(dir)) {
                    dirMap.set(dir, []);
                }
                dirMap.get(dir).push(path.basename(file));
            }
        }
        // Build tree structure
        const rootFiles = dirMap.get(".") || [];
        const subdirs = Array.from(dirMap.keys()).filter((d) => d !== ".");
        // Add root level files
        rootFiles.forEach((file, index) => {
            const isLast = index === rootFiles.length - 1 && subdirs.length === 0;
            tree.push(`${isLast ? "└──" : "├──"} ${file}`);
        });
        // Add subdirectories
        subdirs.forEach((dir, dirIndex) => {
            const isLastDir = dirIndex === subdirs.length - 1;
            const dirFiles = dirMap.get(dir) || [];
            const dirName = dir.split(path.sep).pop() || dir;
            tree.push(`${isLastDir ? "└──" : "├──"} ${dirName}/`);
            dirFiles.forEach((file, fileIndex) => {
                const isLastFile = fileIndex === dirFiles.length - 1;
                const prefix = isLastDir ? "    " : "│   ";
                tree.push(`${prefix}${isLastFile ? "└──" : "├──"} ${file}`);
            });
        });
        return tree.join("\n");
    }
}
//# sourceMappingURL=fileManager.js.map