/**
 * File Manager Utility
 * Handles file creation, directory structure, and tree display
 */
export declare class FileManager {
    private basePath;
    constructor(basePath?: string);
    /**
     * Sanitize folder name from task description
     * @param task - Task description
     * @returns Sanitized folder name
     */
    private sanitizeFolderName;
    /**
     * Parse code markdown to extract files
     * @param codeMarkdown - Code in markdown format with code blocks
     * @returns Array of file objects with path and content
     */
    private parseCodeFiles;
    /**
     * Infer file extension from code content
     * @param content - Code content
     * @returns File extension with dot
     */
    private inferExtensionFromContent;
    /**
     * Get file extension from language identifier
     * @param language - Language identifier (e.g., "javascript", "python")
     * @returns File extension with dot
     */
    private getExtensionFromLanguage;
    /**
     * Create directory structure
     * @param dirPath - Directory path to create
     */
    private ensureDirectory;
    /**
     * Write files from parsed code
     * @param task - Task description (used for folder name)
     * @param codeMarkdown - Code in markdown format
     * @returns Created folder path and array of created file paths
     */
    writeFiles(task: string, codeMarkdown: string): Promise<{
        folderPath: string;
        files: string[];
    }>;
    /**
     * Write files to a specific folder
     * @param folderPath - Target folder path
     * @param files - Array of file objects
     * @returns Folder path and array of created file paths
     */
    private writeFilesToFolder;
    /**
     * Generate directory tree structure from filesystem (recursive)
     * @param folderPath - Root folder path
     * @returns Directory tree string
     */
    generateDirectoryTreeFromFilesystem(folderPath: string): Promise<string>;
    /**
     * Recursively build directory tree structure
     * @param dirPath - Current directory path
     * @param prefix - Prefix for tree indentation
     * @param tree - Array to store tree lines
     * @param isRoot - Whether this is the root directory
     */
    private buildTreeRecursive;
    /**
     * Generate "How to run" instructions based on project files
     * @param folderPath - Project folder path
     * @returns Array of instruction strings
     */
    generateRunInstructions(folderPath: string): Promise<string[]>;
    /**
     * Generate directory tree structure (legacy method, kept for compatibility)
     * @param folderPath - Root folder path
     * @param files - Array of relative file paths
     * @returns Directory tree string
     */
    generateDirectoryTree(folderPath: string, files: string[]): string;
}
//# sourceMappingURL=fileManager.d.ts.map