export class EditorManager {
    constructor() {
        this.editorContainer = document.getElementById('editorContainer');
        this.markdownViewer = document.getElementById('markdownViewer');
        this.previewPane = document.getElementById('editorPreview');
        this.modeToggle = document.getElementById('modeToggle');
        this.modeText = this.modeToggle.querySelector('.mode-text');
        this.isEditorMode = false;
        this.currentFile = null;
        this.onSave = null;

        this.cm = CodeMirror.fromTextArea(document.getElementById('markdownEditor'), {
            mode: 'markdown',
            theme: 'dracula',
            lineNumbers: true,
            lineWrapping: true,
            viewportMargin: Infinity
        });

        this.init();
    }

    init() {
        this.modeToggle.addEventListener('click', () => this.toggleMode());
        this.cm.on('change', () => {
            this.updatePreview();
        });

        document.getElementById('saveChanges').addEventListener('click', () => {
            if (this.onSave && this.currentFile) {
                this.onSave(this.currentFile.path, this.cm.getValue());
            }
        });
    }

    toggleMode() {
        this.isEditorMode = !this.isEditorMode;
        if (this.isEditorMode) {
            this.editorContainer.classList.remove('hidden');
            this.markdownViewer.classList.add('hidden');
            this.modeText.setAttribute('data-i18n', 'mode_edit');
            this.modeToggle.querySelector('i').className = 'fas fa-edit';
            this.cm.refresh();
        } else {
            this.editorContainer.classList.add('hidden');
            this.markdownViewer.classList.remove('hidden');
            this.modeText.setAttribute('data-i18n', 'mode_read');
            this.modeToggle.querySelector('i').className = 'fas fa-book-open';
        }

        // Trigger translation update for the button text
        window.languageManager.translatePage();
    }

    loadFile(file) {
        this.currentFile = file;
        this.cm.setValue(file.content);
        this.updatePreview();
    }

    updatePreview() {
        const content = this.cm.getValue();
        // Use the renderer to parse preview
        const html = marked.parse(content);
        this.previewPane.innerHTML = html;

        // Mermaid in preview
        this.renderMermaidPreview();
    }

    async renderMermaidPreview() {
        const blocks = this.previewPane.querySelectorAll('pre code.language-mermaid');
        for (const block of blocks) {
            const code = block.textContent;
            const container = block.parentElement;
            const id = 'mermaid-preview-' + Math.random().toString(36).substr(2, 9);
            try {
                const { svg } = await mermaid.render(id, code);
                container.outerHTML = `<div class="mermaid-diagram">${svg}</div>`;
            } catch (e) {
                console.error('Mermaid preview error:', e);
            }
        }
    }
}
