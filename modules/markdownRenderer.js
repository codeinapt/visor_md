export class MarkdownRenderer {
    constructor() {
        this.viewerContent = document.getElementById('viewerContent');
        this.indexList = document.getElementById('indexList');

        // Configure Marked
        marked.setOptions({
            headerIds: true,
            gfm: true,
            breaks: true,
            highlight: function (code, lang) {
                return code; // Syntax highlighting could be added here
            }
        });

        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark'
        });
    }

    render(markdown) {
        // Render content
        const htmlContent = marked.parse(markdown);
        this.viewerContent.innerHTML = htmlContent;

        // Generate Index
        this.generateIndex();

        // Render Mermaid Diagrams
        this.renderMermaid();
    }

    generateIndex() {
        this.indexList.innerHTML = '';
        const headers = this.viewerContent.querySelectorAll('h1, h2, h3');

        headers.forEach(header => {
            const id = header.id || header.textContent.toLowerCase().replace(/\s+/g, '-');
            header.id = id;

            const li = document.createElement('li');
            li.className = `index-item level-${header.tagName.toLowerCase()}`;

            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = header.textContent;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                header.scrollIntoView({ behavior: 'smooth' });
            });

            li.appendChild(a);
            this.indexList.appendChild(li);
        });
    }

    async renderMermaid() {
        const blocks = this.viewerContent.querySelectorAll('pre code.language-mermaid');
        for (const block of blocks) {
            const code = block.textContent;
            const container = block.parentElement;
            const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);

            try {
                const { render } = mermaid;
                const { svg } = await mermaid.render(id, code);
                container.outerHTML = `<div class="mermaid-diagram">${svg}</div>`;
            } catch (e) {
                console.error('Mermaid render error:', e);
                container.innerHTML = `<div class="error">Mermaid Error: ${e.message}</div>`;
            }
        }
    }
}
