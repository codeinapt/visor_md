export class FileLoader {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.dirInput = document.getElementById('dirInput');
        this.files = []; // Array of { name: string, path: string, content: string, lastModified: Date }
        this.onFilesLoaded = null;
    }

    init() {
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        this.dirInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    }

    async handleFiles(fileList) {
        this.files = [];
        const promises = Array.from(fileList).filter(file => file.name.endsWith('.md')).map(async (file) => {
            const content = await this.readFile(file);
            const path = file.webkitRelativePath || file.name;
            this.files.push({
                name: file.name,
                path: path,
                content: content,
                lastModified: new Date(file.lastModified)
            });
        });

        await Promise.all(promises);
        if (this.onFilesLoaded) this.onFilesLoaded(this.files);
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    getFileByPath(path) {
        return this.files.find(f => f.path === path);
    }

    updateFileContent(path, newContent) {
        const file = this.getFileByPath(path);
        if (file) {
            file.content = newContent;
            file.lastModified = new Date();
        }
    }
}
