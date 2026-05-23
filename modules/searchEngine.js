export class SearchEngine {
    constructor() {
        this.index = []; // Array of { path: string, content: string }
        this.searchInput = document.getElementById('globalSearch');
        this.searchModal = document.getElementById('searchModal');
        this.resultsList = document.getElementById('searchResultsList');
        this.onResultClick = null;

        this.init();
    }

    init() {
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.search(this.searchInput.value);
            }
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.searchModal.classList.add('hidden');
        });
    }

    setFiles(files) {
        this.index = files.map(f => ({
            path: f.path,
            content: f.content,
            name: f.name
        }));
    }

    search(query) {
        if (!query.trim()) return;

        const results = [];
        const regex = new RegExp(this.escapeRegExp(query), 'gi');

        this.index.forEach(file => {
            const matches = [...file.content.matchAll(regex)];
            if (matches.length > 0 || file.name.match(regex)) {
                // Find snippets for each match
                matches.slice(0, 3).forEach(match => {
                    const lineNumber = file.content.substring(0, match.index).split('\n').length;
                    const snippet = this.getSnippet(file.content, match.index, query);
                    results.push({
                        path: file.path,
                        name: file.name,
                        snippet: snippet,
                        line: lineNumber
                    });
                });

                // If only name matches but no content matches yet
                if (matches.length === 0 && file.name.match(regex)) {
                    results.push({
                        path: file.path,
                        name: file.name,
                        snippet: '<span class="search-result-file">Coincidencia en nombre de archivo</span>',
                        line: '-'
                    });
                }
            }
        });

        this.renderResults(results, query);
        this.searchModal.classList.remove('hidden');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getSnippet(content, matchIndex, query) {
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(content.length, matchIndex + query.length + 60);
        let snippet = content.substring(start, end);

        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';

        // Highlight only the match in this snippet
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return snippet.replace(regex, '<span class="match">$1</span>');
    }

    renderResults(results, query) {
        this.resultsList.innerHTML = '';
        if (results.length === 0) {
            this.resultsList.innerHTML = '<div class="no-results" data-i18n="no_results">No se encontraron coincidencias.</div>';
            return;
        }

        results.forEach(res => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="search-result-header">
                    <span class="search-result-file">${res.path}</span>
                    <span class="search-result-line">Línea ${res.line}</span>
                </div>
                <div class="search-result-snippet">${res.snippet}</div>
            `;
            item.addEventListener('click', () => {
                if (this.onResultClick) this.onResultClick(res.path);
                this.searchModal.classList.add('hidden');
            });
            this.resultsList.appendChild(item);
        });
    }
}
