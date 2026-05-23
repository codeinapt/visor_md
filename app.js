import { ThemeManager } from './modules/themeManager.js';
import { LanguageManager } from './modules/languageManager.js';
import { FileLoader } from './modules/fileLoader.js';
import { FileTree } from './modules/fileTree.js';
import { MarkdownRenderer } from './modules/markdownRenderer.js';
import { SearchEngine } from './modules/searchEngine.js';
import { PDFGenerator } from './modules/pdfGenerator.js';
import { EditorManager } from './modules/editorManager.js';

class App {
    constructor() {
        // Initialize Core Managers
        this.themeManager = new ThemeManager();
        this.languageManager = new LanguageManager();
        window.languageManager = this.languageManager; // Global for editor toggle

        // Initialize Specialized Modules
        this.fileLoader = new FileLoader();
        this.fileTree = new FileTree();
        this.renderer = new MarkdownRenderer();
        this.searchEngine = new SearchEngine();
        this.pdfGenerator = new PDFGenerator(this.fileLoader, this.renderer);
        this.editorManager = new EditorManager();

        this.currentFile = null;

        this.init();
    }

    init() {
        // Module Hooks
        this.fileLoader.onFilesLoaded = (files) => {
            this.fileTree.render(files);
            this.searchEngine.setFiles(files);
            // Optionally load first file
            if (files.length > 0) {
                this.selectFile(files[0]);
            }
        };

        this.fileTree.onFileSelect = (file) => {
            this.selectFile(file);
        };

        this.searchEngine.onResultClick = (path) => {
            const file = this.fileLoader.getFileByPath(path);
            if (file) this.selectFile(file);
        };

        this.editorManager.onSave = (path, newContent) => {
            this.fileLoader.updateFileContent(path, newContent);
            const file = this.fileLoader.getFileByPath(path);
            this.searchEngine.setFiles(this.fileLoader.files); // Update index
            this.renderer.render(newContent); // Re-render in viewer too
        };

        this.fileLoader.init();
    }

    selectFile(file) {
        this.currentFile = file;
        this.renderer.render(file.content);
        this.editorManager.loadFile(file);
    }
}

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
